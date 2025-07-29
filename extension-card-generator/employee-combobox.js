/**
 * مكون Combobox محسن للبحث عن الموظفين
 * يدعم البحث بالاسم والهوية الوطنية مع عرض جميع الموظفين
 */

class EmployeeCombobox {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            placeholder: 'ابحث عن موظف بالاسم أو الهوية الوطنية...',
            noResultsText: 'لا توجد نتائج',
            loadingText: 'جاري التحميل...',
            showAllText: 'عرض جميع الموظفين',
            onSelect: null,
            ...options
        };
        
        this.employees = [];
        this.filteredEmployees = [];
        this.selectedEmployee = null;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.loadEmployees();
    }

    createHTML() {
        this.container.innerHTML = `
            <div class="employee-combobox">
                <div class="combobox-input-container">
                    <input 
                        type="text" 
                        class="combobox-input" 
                        placeholder="${this.options.placeholder}"
                        autocomplete="off"
                    >
                    <button type="button" class="combobox-toggle" aria-label="فتح القائمة">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                    </button>
                </div>
                <div class="combobox-dropdown" style="display: none;">
                    <div class="combobox-loading">${this.options.loadingText}</div>
                    <div class="combobox-options"></div>
                    <div class="combobox-no-results" style="display: none;">
                        ${this.options.noResultsText}
                    </div>
                </div>
            </div>
        `;

        // إضافة CSS
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('employee-combobox-styles')) return;

        const style = document.createElement('style');
        style.id = 'employee-combobox-styles';
        style.textContent = `
            .employee-combobox {
                position: relative;
                width: 100%;
                font-family: 'Cairo', Arial, sans-serif;
            }

            .combobox-input-container {
                position: relative;
                display: flex;
                align-items: center;
            }

            .combobox-input {
                width: 100%;
                padding: 12px 40px 12px 15px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 16px;
                background: white;
                transition: all 0.3s ease;
                direction: rtl;
            }

            .combobox-input:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
            }

            .combobox-toggle {
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                color: #6c757d;
                transition: all 0.3s ease;
                border-radius: 4px;
            }

            .combobox-toggle:hover {
                background: #f8f9fa;
                color: #495057;
            }

            .combobox-toggle.open {
                transform: translateY(-50%) rotate(180deg);
            }

            .combobox-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 2px solid #e1e5e9;
                border-top: none;
                border-radius: 0 0 8px 8px;
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .combobox-loading {
                padding: 15px;
                text-align: center;
                color: #6c757d;
                font-style: italic;
            }

            .combobox-options {
                max-height: 250px;
                overflow-y: auto;
            }

            .combobox-option {
                padding: 12px 15px;
                cursor: pointer;
                border-bottom: 1px solid #f8f9fa;
                transition: background-color 0.2s ease;
                direction: rtl;
            }

            .combobox-option:hover {
                background: #f8f9fa;
            }

            .combobox-option.selected {
                background: #e3f2fd;
                color: #1976d2;
            }

            .combobox-option.highlighted {
                background: #e7f3ff;
            }

            .employee-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .employee-name {
                font-weight: 600;
                color: #2c3e50;
                font-size: 14px;
            }

            .employee-details {
                font-size: 12px;
                color: #6c757d;
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }

            .employee-detail {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .combobox-no-results {
                padding: 15px;
                text-align: center;
                color: #6c757d;
                font-style: italic;
            }

            .show-all-option {
                background: #f8f9fa;
                border-bottom: 2px solid #dee2e6;
                font-weight: 600;
                color: #495057;
            }

            .show-all-option:hover {
                background: #e9ecef;
            }

            /* تحسينات للأجهزة المحمولة */
            @media (max-width: 768px) {
                .combobox-dropdown {
                    max-height: 250px;
                }

                .combobox-option {
                    padding: 15px 12px;
                }

                .employee-details {
                    flex-direction: column;
                    gap: 2px;
                }
            }

            /* تحسين التمرير */
            .combobox-options::-webkit-scrollbar {
                width: 6px;
            }

            .combobox-options::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }

            .combobox-options::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }

            .combobox-options::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
        `;
        document.head.appendChild(style);
    }

    attachEvents() {
        const input = this.container.querySelector('.combobox-input');
        const toggle = this.container.querySelector('.combobox-toggle');
        const dropdown = this.container.querySelector('.combobox-dropdown');

        // أحداث الإدخال
        input.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        input.addEventListener('focus', () => {
            this.open();
        });

        input.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // زر التبديل
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // إغلاق عند النقر خارج المكون
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });
    }

    async loadEmployees() {
        try {
            const response = await fetch('employees_api.php?action=list');
            const data = await response.json();
            
            if (data.success) {
                this.employees = data.employees || [];
                this.filteredEmployees = [...this.employees];
                this.hideLoading();
                this.renderOptions();
            } else {
                this.showError('فشل في تحميل بيانات الموظفين');
            }
        } catch (error) {
            console.error('خطأ في تحميل الموظفين:', error);
            this.showError('خطأ في الاتصال بالخادم');
        }
    }

    handleInput(value) {
        this.filterEmployees(value);
        this.renderOptions();
        
        if (!this.isOpen) {
            this.open();
        }
    }

    filterEmployees(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredEmployees = [...this.employees];
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        this.filteredEmployees = this.employees.filter(employee => {
            return (
                employee.name.toLowerCase().includes(term) ||
                employee.national_id.includes(term) ||
                employee.employee_number.includes(term) ||
                employee.position.toLowerCase().includes(term) ||
                employee.department.toLowerCase().includes(term)
            );
        });
    }

    renderOptions() {
        const optionsContainer = this.container.querySelector('.combobox-options');
        const noResults = this.container.querySelector('.combobox-no-results');
        
        optionsContainer.innerHTML = '';
        
        // خيار عرض جميع الموظفين
        if (this.employees.length > 0) {
            const showAllOption = document.createElement('div');
            showAllOption.className = 'combobox-option show-all-option';
            showAllOption.innerHTML = `
                <div class="employee-info">
                    <div class="employee-name">📋 ${this.options.showAllText} (${this.employees.length})</div>
                </div>
            `;
            showAllOption.addEventListener('click', () => {
                this.showAllEmployees();
            });
            optionsContainer.appendChild(showAllOption);
        }

        // عرض النتائج المفلترة
        if (this.filteredEmployees.length === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
            
            this.filteredEmployees.forEach(employee => {
                const option = this.createEmployeeOption(employee);
                optionsContainer.appendChild(option);
            });
        }
    }

    createEmployeeOption(employee) {
        const option = document.createElement('div');
        option.className = 'combobox-option';
        option.dataset.employeeId = employee.id;
        
        option.innerHTML = `
            <div class="employee-info">
                <div class="employee-name">${employee.name}</div>
                <div class="employee-details">
                    <div class="employee-detail">
                        <span>🆔</span>
                        <span>${employee.national_id}</span>
                    </div>
                    <div class="employee-detail">
                        <span>👤</span>
                        <span>${employee.employee_number}</span>
                    </div>
                    <div class="employee-detail">
                        <span>💼</span>
                        <span>${employee.position}</span>
                    </div>
                    <div class="employee-detail">
                        <span>🏢</span>
                        <span>${employee.department}</span>
                    </div>
                </div>
            </div>
        `;

        option.addEventListener('click', () => {
            this.selectEmployee(employee);
        });

        return option;
    }

    selectEmployee(employee) {
        this.selectedEmployee = employee;
        const input = this.container.querySelector('.combobox-input');
        input.value = `${employee.name} - ${employee.national_id}`;
        
        this.close();
        
        if (this.options.onSelect) {
            this.options.onSelect(employee);
        }
    }

    showAllEmployees() {
        const input = this.container.querySelector('.combobox-input');
        input.value = '';
        this.filteredEmployees = [...this.employees];
        this.renderOptions();
    }

    open() {
        if (this.isOpen) return;
        
        const dropdown = this.container.querySelector('.combobox-dropdown');
        const toggle = this.container.querySelector('.combobox-toggle');
        
        dropdown.style.display = 'block';
        toggle.classList.add('open');
        this.isOpen = true;
    }

    close() {
        if (!this.isOpen) return;
        
        const dropdown = this.container.querySelector('.combobox-dropdown');
        const toggle = this.container.querySelector('.combobox-toggle');
        
        dropdown.style.display = 'none';
        toggle.classList.remove('open');
        this.isOpen = false;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    hideLoading() {
        const loading = this.container.querySelector('.combobox-loading');
        loading.style.display = 'none';
    }

    showError(message) {
        const loading = this.container.querySelector('.combobox-loading');
        loading.textContent = message;
        loading.style.color = '#dc3545';
    }

    handleKeydown(e) {
        // يمكن إضافة التنقل بالكيبورد هنا لاحقاً
        if (e.key === 'Escape') {
            this.close();
        }
    }

    // وظائف عامة
    getSelectedEmployee() {
        return this.selectedEmployee;
    }

    clearSelection() {
        this.selectedEmployee = null;
        const input = this.container.querySelector('.combobox-input');
        input.value = '';
    }

    setEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id == employeeId);
        if (employee) {
            this.selectEmployee(employee);
        }
    }
}

// تصدير للاستخدام العام
window.EmployeeCombobox = EmployeeCombobox;
