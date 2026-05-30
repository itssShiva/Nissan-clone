/**
 * Nissan India — Global Form Handler
 * =====================================
 * Handles validation AND API submission for ALL forms on the site.
 *
 * How it works:
 *  1. Attaches to every <form> on DOMContentLoaded.
 *  2. Validates all required fields, email format, phone format, etc.
 *  3. On valid: POSTs form data as JSON to the backend API.
 *  4. Shows a success or error message to the user.
 *
 * Exclusions (forms that handle their own submit logic):
 *  - Forms with id="login-form"          (OTP flow in login.html)
 *  - Forms with data-custom-submit="true" (e.g. request-a-callback uses its own handler)
 */

(function () {
    'use strict';

    // ---- Resolve API Base URL ----
    // Uses window.APP_CONFIG if available (set by src/config.js loaded before this).
    // Falls back to auto-detection so this script works standalone.
    function getApiBaseUrl() {
        if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
            return window.APP_CONFIG.API_BASE_URL;
        }
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        return isLocalhost ? 'http://localhost:5000/api' : (window.location.origin + '/api');
    }

    // ---- Inject validation styles ----
    if (!document.getElementById('nf-validation-styles')) {
        const style = document.createElement('style');
        style.id = 'nf-validation-styles';
        style.textContent = `
            .nfv-error-msg {
                color: #c00;
                font-size: 12px;
                margin-top: 4px;
                display: block;
                font-family: inherit;
                line-height: 1.4;
            }
            .nfv-field-error {
                border-color: #c00 !important;
                background-color: #fff8f8 !important;
            }
            .nfv-global-error {
                color: #c00;
                background: #fff8f8;
                border: 1px solid #c00;
                border-radius: 4px;
                padding: 10px 14px;
                margin-bottom: 16px;
                font-size: 14px;
                text-align: center;
            }
            .nfv-success-box {
                padding: 30px 20px;
                text-align: center;
                color: #1a7a3c;
                border: 2px solid #1a7a3c;
                border-radius: 6px;
                background: #f6fff9;
            }
            .nfv-success-box h3 {
                margin: 0 0 10px;
                font-size: 20px;
            }
            .nfv-success-box p {
                margin: 0;
                font-size: 15px;
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var forms = document.querySelectorAll('form');

        forms.forEach(function (form) {
            // Skip: login form (has its own OTP flow)
            if (form.id === 'login-form') return;

            // Skip: forms with a custom submit handler declared in the page
            if (form.getAttribute('data-custom-submit') === 'true') return;

            // Disable browser default validation UI
            form.setAttribute('novalidate', 'true');

            // ---- Submit handler ----
            form.addEventListener('submit', function (event) {
                event.preventDefault();

                // Clear previous errors
                clearErrors(form);

                var isValid = validateForm(form);

                if (!isValid) {
                    // Scroll to first error
                    var firstError = form.querySelector('.nfv-field-error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }

                // ---- Valid: submit to API ----
                submitFormToApi(form);
            });

            // ---- Live field error clearing on input ----
            var fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(function (field) {
                field.addEventListener('input', function () {
                    clearFieldError(field);
                });
                field.addEventListener('change', function () {
                    clearFieldError(field);
                });
            });
        });
    });

    // ========== Validation ==========

    function validateForm(form) {
        var isValid = true;
        var fields = form.querySelectorAll('input, select, textarea');

        fields.forEach(function (field) {
            // Trim text-type values
            if (['text', 'email', 'tel', 'search'].includes(field.type)) {
                field.value = field.value.trim();
            }

            var fieldValid = true;
            var errorMsg = '';

            // 1. Required check
            if (field.hasAttribute('required')) {
                if (field.type === 'checkbox') {
                    if (!field.checked) { fieldValid = false; errorMsg = 'This field is required.'; }
                } else if (field.type === 'radio') {
                    var radioGroup = form.querySelectorAll('input[name="' + field.name + '"]');
                    var anyChecked = Array.from(radioGroup).some(function (r) { return r.checked; });
                    if (!anyChecked) { fieldValid = false; errorMsg = 'Please select an option.'; }
                } else if (!field.value) {
                    fieldValid = false;
                    errorMsg = 'This field is required.';
                }
            }

            // 2. Email format
            if (fieldValid && field.type === 'email' && field.value) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                    fieldValid = false;
                    errorMsg = 'Please enter a valid email address.';
                }
            }

            // 3. Phone (10-digit Indian mobile)
            if (fieldValid && field.type === 'tel' && field.value) {
                if (!/^[6-9][0-9]{9}$/.test(field.value)) {
                    fieldValid = false;
                    errorMsg = 'Please enter a valid 10-digit mobile number starting with 6-9.';
                }
            }

            // 4. Pattern check
            if (fieldValid && field.hasAttribute('pattern') && field.value) {
                var pattern = new RegExp('^(?:' + field.getAttribute('pattern') + ')$');
                if (!pattern.test(field.value)) {
                    fieldValid = false;
                    errorMsg = field.getAttribute('title') || 'Invalid format.';
                }
            }

            // 5. Minlength check
            if (fieldValid && field.hasAttribute('minlength') && field.value) {
                var min = parseInt(field.getAttribute('minlength'), 10);
                if (field.value.length < min) {
                    fieldValid = false;
                    errorMsg = 'Minimum ' + min + ' characters required.';
                }
            }

            if (!fieldValid) {
                isValid = false;
                showFieldError(field, errorMsg);
            }
        });

        return isValid;
    }

    // ========== API Submission ==========

    function submitFormToApi(form) {
        var endpoint = getApiBaseUrl() + '/forms/submit';

        // Gather form data safely by querying all interactive inputs/selects/textareas
        var payload = {};
        var fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(function (f) {
            if (f.type === 'submit' || f.type === 'button') return;

            // Priority: name attribute -> data-label -> id
            var key = f.getAttribute('name') || f.getAttribute('data-label') || f.id;
            if (!key) return;

            var val = '';
            if (f.type === 'checkbox') {
                val = f.checked ? 'Yes' : 'No';
            } else if (f.type === 'radio') {
                if (f.checked) {
                    val = f.value;
                } else {
                    return; // Skip unselected radio inputs
                }
            } else {
                val = f.value;
            }

            payload[key] = val;
        });

        // Add form name for email subject
        var formName = form.getAttribute('data-form-name') || form.id || 'Website Form';
        payload.formName = formName;

        // Button loading state
        var submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
        var originalText = submitBtn ? (submitBtn.value || submitBtn.textContent.trim()) : 'Submit';
        if (submitBtn) {
            submitBtn.disabled = true;
            if (submitBtn.tagName === 'INPUT') submitBtn.value = 'Submitting…';
            else submitBtn.textContent = 'Submitting…';
        }

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(function (response) {
            return response.json().then(function (data) {
                return { ok: response.ok, data: data };
            });
        })
        .then(function (result) {
            if (result.ok && result.data.success) {
                // Show global success toast
                showGlobalToast(result.data.message || 'Your request has been submitted successfully. Our team will contact you shortly.', 'success');
                
                // Reset form
                form.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
                    else submitBtn.textContent = originalText;
                }
            } else {
                throw new Error(result.data.message || 'Submission failed. Please try again.');
            }
        })
        .catch(function (error) {
            console.error('[Form] Submission error:', error.message);

            // Show global error toast
            showGlobalToast(error.message || 'A network error occurred. Please check your connection and try again.', 'error');

            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
                else submitBtn.textContent = originalText;
            }
        });
    }

    // ========== Toast Notification ==========

    window.showGlobalToast = function(message, type) {
        var toastId = 'nf-global-toast';
        var toast = document.getElementById(toastId);
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = toastId;
            document.body.appendChild(toast);
        }
        
        var bg = type === 'error' ? '#c3002f' : '#1a7a3c';
        var icon = type === 'error' ? '❌' : '✅';
        
        toast.innerHTML = '<span style="font-size:18px;">' + icon + '</span> <div>' + message + '</div>';
        
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            background: ${bg};
            color: #fff;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 500;
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translate(-50%, 30px);
            z-index: 100000;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 90%;
            width: max-content;
            font-family: 'Inter', sans-serif;
        `;
        
        // Force reflow for animation
        void toast.offsetWidth;
        
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';
        
        // Clear previous timeout if exists
        if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
        
        toast.hideTimeout = setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 30px)';
        }, 4000);
    }

    // ========== Error UI Helpers ==========

    function showFieldError(field, message) {
        field.classList.add('nfv-field-error');

        // Don't add duplicate error spans
        var existing = field.parentElement.querySelector('.nfv-error-msg[data-for="' + field.id + '"]');
        if (existing) { existing.textContent = message; return; }

        var span = document.createElement('span');
        span.className = 'nfv-error-msg';
        span.setAttribute('data-for', field.id || '');
        span.textContent = message;

        if (field.type === 'checkbox' || field.type === 'radio') {
            field.parentElement.appendChild(span);
        } else {
            field.insertAdjacentElement('afterend', span);
        }
    }

    function clearFieldError(field) {
        field.classList.remove('nfv-field-error');
        var err = field.parentElement.querySelector('.nfv-error-msg[data-for="' + field.id + '"]');
        if (err) err.remove();
    }

    function clearErrors(form) {
        form.querySelectorAll('.nfv-error-msg').forEach(function (el) { el.remove(); });
        form.querySelectorAll('.nfv-field-error').forEach(function (el) { el.classList.remove('nfv-field-error'); });
    }

})();
