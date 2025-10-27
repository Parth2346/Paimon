// Travel and Errand Planner - JavaScript Functionality
// This file contains all the interactive features for the website

// Global variables
let trips = JSON.parse(localStorage.getItem('trips')) || [];
let errands = JSON.parse(localStorage.getItem('errands')) || [];
let currentFilter = 'all';

// Travel tips for the quote of the day feature
const travelTips = [
    "Always pack a portable phone charger - you'll thank yourself later!",
    "Take photos of important documents and store them in a secure cloud folder.",
    "Learn a few basic phrases in the local language - locals appreciate the effort.",
    "Pack light! You'll likely buy souvenirs and need extra space on the way back.",
    "Research local customs and etiquette before visiting a new country.",
    "Keep a digital copy of your itinerary accessible offline.",
    "Always have some local currency in cash for emergencies.",
    "Take advantage of free walking tours in new cities.",
    "Pack a small first aid kit with basic medications.",
    "Download offline maps before traveling to areas with poor internet.",
    "Keep your passport and important documents in a secure, separate location.",
    "Take photos of your luggage before checking it in at the airport.",
    "Research local transportation options before arriving at your destination.",
    "Pack a universal adapter for international travel.",
    "Always inform your bank about your travel plans to avoid card blocks."
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize mobile navigation
    initMobileNavigation();
    
    // Initialize based on current page
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            initHomePage();
            break;
        case 'trips':
            initTripsPage();
            break;
        case 'errands':
            initErrandsPage();
            break;
        case 'contact':
            initContactPage();
            break;
        default:
            break;
    }
    
    // Add smooth scrolling to all links
    addSmoothScrolling();
    
    // Add fade-in animations to elements
    addScrollAnimations();
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
}

// Mobile Navigation
function initMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Home Page Functions
function initHomePage() {
    // Set up daily tip rotation
    displayDailyTip();
    
    // Add click handlers for hero buttons
    const planTripBtn = document.querySelector('.hero-buttons .btn-primary');
    const organizeErrandsBtn = document.querySelector('.hero-buttons .btn-secondary');
    
    if (planTripBtn) {
        planTripBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'trips.html';
        });
    }
    
    if (organizeErrandsBtn) {
        organizeErrandsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'errands.html';
        });
    }
}

function displayDailyTip() {
    const tipElement = document.getElementById('daily-tip');
    if (tipElement) {
        // Get current date to ensure consistent tip for the day
        const today = new Date().getDate();
        const tipIndex = today % travelTips.length;
        tipElement.textContent = travelTips[tipIndex];
    }
}

// Trips Page Functions
function initTripsPage() {
    const tripForm = document.getElementById('trip-form');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-trip-form');
    const closeModal = document.querySelector('.close');
    
    // Load and display trips
    displayTrips();
    
    // Handle form submission
    if (tripForm) {
        tripForm.addEventListener('submit', handleTripSubmit);
    }
    
    // Handle edit form submission
    if (editForm) {
        editForm.addEventListener('submit', handleTripEdit);
    }
    
    // Handle modal close
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }
    
    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }
    
    // Set minimum date to today
    setMinDate();
}

function handleTripSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const trip = {
        id: Date.now().toString(),
        destination: formData.get('destination'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        budget: formData.get('budget') || 0,
        notes: formData.get('notes') || '',
        createdAt: new Date().toISOString()
    };
    
    // Validate dates
    if (new Date(trip.startDate) >= new Date(trip.endDate)) {
        alert('End date must be after start date');
        return;
    }
    
    trips.push(trip);
    saveTrips();
    displayTrips();
    e.target.reset();
    
    // Show success message
    showNotification('Trip added successfully!', 'success');
}

function handleTripEdit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const tripId = formData.get('tripId');
    
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    if (tripIndex !== -1) {
        trips[tripIndex] = {
            ...trips[tripIndex],
            destination: formData.get('destination'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            budget: formData.get('budget') || 0,
            notes: formData.get('notes') || ''
        };
        
        saveTrips();
        displayTrips();
        closeEditModal();
        
        showNotification('Trip updated successfully!', 'success');
    }
}

function displayTrips() {
    const container = document.getElementById('trips-container');
    const noTrips = document.getElementById('no-trips');
    
    if (!container) return;
    
    if (trips.length === 0) {
        container.innerHTML = '';
        if (noTrips) noTrips.style.display = 'block';
        return;
    }
    
    if (noTrips) noTrips.style.display = 'none';
    
    container.innerHTML = trips.map(trip => `
        <div class="trip-card fade-in">
            <div class="trip-header">
                <h3 class="trip-destination">${escapeHtml(trip.destination)}</h3>
                <div class="trip-actions">
                    <button class="btn-edit" onclick="editTrip('${trip.id}')">✏️</button>
                    <button class="btn-delete" onclick="deleteTrip('${trip.id}')">🗑️</button>
                </div>
            </div>
            <div class="trip-dates">
                📅 ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}
            </div>
            ${trip.budget > 0 ? `<div class="trip-budget">💰 Budget: ₹${parseFloat(trip.budget).toLocaleString()}</div>` : ''}
            ${trip.notes ? `<div class="trip-notes">${escapeHtml(trip.notes)}</div>` : ''}
        </div>
    `).join('');
}

function editTrip(tripId) {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Populate edit form
    document.getElementById('edit-trip-id').value = trip.id;
    document.getElementById('edit-destination').value = trip.destination;
    document.getElementById('edit-start-date').value = trip.startDate;
    document.getElementById('edit-end-date').value = trip.endDate;
    document.getElementById('edit-budget').value = trip.budget;
    document.getElementById('edit-notes').value = trip.notes;
    
    // Show modal
    document.getElementById('edit-modal').style.display = 'block';
}

function deleteTrip(tripId) {
    if (confirm('Are you sure you want to delete this trip?')) {
        trips = trips.filter(trip => trip.id !== tripId);
        saveTrips();
        displayTrips();
        showNotification('Trip deleted successfully!', 'success');
    }
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const editStartDateInput = document.getElementById('edit-start-date');
    const editEndDateInput = document.getElementById('edit-end-date');
    
    if (startDateInput) startDateInput.min = today;
    if (endDateInput) endDateInput.min = today;
    if (editStartDateInput) editStartDateInput.min = today;
    if (editEndDateInput) editEndDateInput.min = today;
}

// Errands Page Functions
function initErrandsPage() {
    const errandForm = document.getElementById('errand-form');
    const editModal = document.getElementById('edit-errand-modal');
    const editForm = document.getElementById('edit-errand-form');
    const closeModal = document.querySelector('#edit-errand-modal .close');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Load and display errands
    displayErrands();
    
    // Handle form submission
    if (errandForm) {
        errandForm.addEventListener('submit', handleErrandSubmit);
    }
    
    // Handle edit form submission
    if (editForm) {
        editForm.addEventListener('submit', handleErrandEdit);
    }
    
    // Handle modal close
    if (closeModal) {
        closeModal.addEventListener('click', closeEditErrandModal);
    }
    
    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                closeEditErrandModal();
            }
        });
    }
    
    // Handle filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            displayErrands();
        });
    });
    
    // Set minimum date to today
    setMinDateErrands();
}

function handleErrandSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errand = {
        id: Date.now().toString(),
        title: formData.get('title'),
        description: formData.get('description') || '',
        priority: formData.get('priority'),
        dueDate: formData.get('dueDate') || '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    errands.push(errand);
    saveErrands();
    displayErrands();
    e.target.reset();
    
    showNotification('Errand added successfully!', 'success');
}

function handleErrandEdit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errandId = formData.get('errandId');
    
    const errandIndex = errands.findIndex(errand => errand.id === errandId);
    if (errandIndex !== -1) {
        errands[errandIndex] = {
            ...errands[errandIndex],
            title: formData.get('title'),
            description: formData.get('description') || '',
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate') || ''
        };
        
        saveErrands();
        displayErrands();
        closeEditErrandModal();
        
        showNotification('Errand updated successfully!', 'success');
    }
}

function displayErrands() {
    const container = document.getElementById('errands-container');
    const noErrands = document.getElementById('no-errands');
    
    if (!container) return;
    
    let filteredErrands = errands;
    
    if (currentFilter === 'pending') {
        filteredErrands = errands.filter(errand => !errand.completed);
    } else if (currentFilter === 'completed') {
        filteredErrands = errands.filter(errand => errand.completed);
    }
    
    if (filteredErrands.length === 0) {
        container.innerHTML = '';
        if (noErrands) noErrands.style.display = 'block';
        return;
    }
    
    if (noErrands) noErrands.style.display = 'none';
    
    container.innerHTML = filteredErrands.map(errand => `
        <div class="errand-item fade-in ${errand.completed ? 'completed' : ''}">
            <div class="errand-header">
                <h3 class="errand-title ${errand.completed ? 'completed' : ''}">${escapeHtml(errand.title)}</h3>
                <div class="errand-actions">
                    <button class="btn-edit" onclick="editErrand('${errand.id}')">✏️</button>
                    <button class="btn-delete" onclick="deleteErrand('${errand.id}')">🗑️</button>
                </div>
            </div>
            <div class="errand-priority priority-${errand.priority}">${errand.priority}</div>
            ${errand.description ? `<div class="errand-description">${escapeHtml(errand.description)}</div>` : ''}
            ${errand.dueDate ? `<div class="errand-due-date">📅 Due: ${formatDate(errand.dueDate)}</div>` : ''}
            <div class="errand-actions" style="margin-top: 1rem;">
                <button class="btn ${errand.completed ? 'btn-secondary' : 'btn-primary'}" 
                        onclick="toggleErrandComplete('${errand.id}')">
                    ${errand.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
            </div>
        </div>
    `).join('');
}

function editErrand(errandId) {
    const errand = errands.find(e => e.id === errandId);
    if (!errand) return;
    
    // Populate edit form
    document.getElementById('edit-errand-id').value = errand.id;
    document.getElementById('edit-errand-title').value = errand.title;
    document.getElementById('edit-errand-description').value = errand.description;
    document.getElementById('edit-errand-priority').value = errand.priority;
    document.getElementById('edit-errand-due-date').value = errand.dueDate;
    
    // Show modal
    document.getElementById('edit-errand-modal').style.display = 'block';
}

function deleteErrand(errandId) {
    if (confirm('Are you sure you want to delete this errand?')) {
        errands = errands.filter(errand => errand.id !== errandId);
        saveErrands();
        displayErrands();
        showNotification('Errand deleted successfully!', 'success');
    }
}

function toggleErrandComplete(errandId) {
    const errand = errands.find(e => e.id === errandId);
    if (errand) {
        errand.completed = !errand.completed;
        saveErrands();
        displayErrands();
        
        const message = errand.completed ? 'Errand marked as complete!' : 'Errand marked as incomplete!';
        showNotification(message, 'success');
    }
}

function closeEditErrandModal() {
    document.getElementById('edit-errand-modal').style.display = 'none';
}

function setMinDateErrands() {
    const today = new Date().toISOString().split('T')[0];
    const dueDateInput = document.getElementById('errand-due-date');
    const editDueDateInput = document.getElementById('edit-errand-due-date');
    
    if (dueDateInput) dueDateInput.min = today;
    if (editDueDateInput) editDueDateInput.min = today;
}

// Contact Page Functions
function initContactPage() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        
        // Add real-time validation
        addFormValidation();
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    if (validateContactForm()) {
        // Simulate form submission
        showSuccessMessage();
        e.target.reset();
        clearValidationErrors();
    }
}

function addFormValidation() {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    
    if (nameInput) {
        nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
    }
    
    if (messageInput) {
        messageInput.addEventListener('blur', () => validateField(messageInput, 'message'));
    }
}

function validateField(field, fieldName) {
    const value = field.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    let isValid = true;
    let errorMessage = '';
    
    switch(fieldName) {
        case 'name':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'message':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long';
            }
            break;
    }
    
    if (errorElement) {
        if (isValid) {
            errorElement.classList.remove('show');
            field.style.borderColor = '#e2e8f0';
        } else {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
            field.style.borderColor = '#e53e3e';
        }
    }
    
    return isValid;
}

function validateContactForm() {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    
    const isNameValid = validateField(nameInput, 'name');
    const isEmailValid = validateField(emailInput, 'email');
    const isMessageValid = validateField(messageInput, 'message');
    
    return isNameValid && isEmailValid && isMessageValid;
}

function clearValidationErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.classList.remove('show');
    });
    
    const inputs = document.querySelectorAll('#contact-form input, #contact-form textarea');
    inputs.forEach(input => {
        input.style.borderColor = '#e2e8f0';
    });
}

function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }
}

// Utility Functions
function saveTrips() {
    localStorage.setItem('trips', JSON.stringify(trips));
}

function saveErrands() {
    localStorage.setItem('errands', JSON.stringify(errands));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#4299e1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.feature-card, .trip-card, .errand-item, .team-member, .tech-item').forEach(el => {
        observer.observe(el);
    });
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
