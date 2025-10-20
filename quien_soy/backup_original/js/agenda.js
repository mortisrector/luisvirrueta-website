// Sistema de Agenda Simplificado para Luis Virrueta
class AgendaTransformadora {
    constructor() {
        this.horariosDisponibles = this.loadHorarios();
        this.sesionesAgendadas = this.loadSesiones();
        this.precios = {
            'sesion-exploratoria': { precio: 0, nombre: 'Sesión Exploratoria GRATIS' },
            'sesion-individual': { precio: 150, nombre: 'Sesión Individual (150€)' },
            'paquete-3-sesiones': { precio: 400, nombre: 'Paquete 3 Sesiones (400€)' },
            'programa-transformacion': { precio: 1200, nombre: 'Programa Completo (1200€)' }
        };
        this.currentMonth = new Date();
        this.selectedSlot = null;
        this.init();
    }

    init() {
        // Buscar o crear el modal
        this.modal = document.getElementById('agendaModal');
        if (!this.modal) {
            this.modal = document.createElement('div');
            this.modal.id = 'agendaModal';
            this.modal.className = 'agenda-modal';
            document.body.appendChild(this.modal);
        }
        
        this.generateModalHTML();
        this.bindEvents();
        this.createAdminPanel();
    }

    generateModalHTML() {
        this.modal.innerHTML = `
            <div id="agendaModal" class="agenda-modal">
                <div class="agenda-modal-content">
                    <div class="agenda-header">
                        <h2><i class="fas fa-calendar-alt"></i> Agenda tu Sesión Transformadora</h2>
                        <button class="agenda-close" onclick="agendaSystem.closeModal()">&times;</button>
                    </div>
                    
                    <div class="agenda-steps">
                        <div class="step active" data-step="1">
                            <span class="step-number">1</span>
                            <span>Elige tu Sesión</span>
                        </div>
                        <div class="step" data-step="2">
                            <span class="step-number">2</span>
                            <span>Selecciona Horario</span>
                        </div>
                        <div class="step" data-step="3">
                            <span class="step-number">3</span>
                            <span>Datos & Pago</span>
                        </div>
                    </div>

                    <!-- PASO 1: Tipo de Sesión -->
                    <div id="step1" class="agenda-step active">
                        <h3>¿Qué tipo de transformación necesitas?</h3>
                        <div class="session-types">
                            <div class="session-type featured" data-type="sesion-exploratoria">
                                <div class="session-badge">¡GRATIS!</div>
                                <i class="fas fa-star"></i>
                                <h4>Sesión Exploratoria</h4>
                                <p>Conoce mi método sin compromiso</p>
                                <span class="price">€0</span>
                            </div>
                            <div class="session-type" data-type="sesion-individual">
                                <i class="fas fa-user"></i>
                                <h4>Sesión Individual</h4>
                                <p>Transformación profunda 1:1</p>
                                <span class="price">€150</span>
                            </div>
                            <div class="session-type" data-type="paquete-3-sesiones">
                                <i class="fas fa-layer-group"></i>
                                <h4>Paquete 3 Sesiones</h4>
                                <p>Proceso completo de transformación</p>
                                <span class="price">€400 <small>(ahorra €50)</small></span>
                            </div>
                            <div class="session-type" data-type="programa-transformacion">
                                <div class="session-badge">MÁS POPULAR</div>
                                <i class="fas fa-infinity"></i>
                                <h4>Programa Completo</h4>
                                <p>Transformación total en 3 meses</p>
                                <span class="price">€1200</span>
                            </div>
                        </div>
                    </div>

                    <!-- PASO 2: Calendario -->
                    <div id="step2" class="agenda-step">
                        <h3>Elige el momento perfecto para tu transformación</h3>
                        <div class="calendar-container">
                            <div class="calendar-nav">
                                <button class="calendar-btn" onclick="agendaSystem.previousMonth()">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <h4 id="currentMonthYear"></h4>
                                <button class="calendar-btn" onclick="agendaSystem.nextMonth()">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <div class="calendar-grid" id="calendarGrid">
                                <!-- Calendario se genera dinámicamente -->
                            </div>
                            <div class="time-slots" id="timeSlots">
                                <!-- Horarios disponibles del día seleccionado -->
                            </div>
                        </div>
                    </div>

                    <!-- PASO 3: Datos y Pago -->
                    <div id="step3" class="agenda-step">
                        <h3>Último paso para tu transformación</h3>
                        <div class="booking-summary">
                            <div class="summary-card">
                                <h4 id="selectedSession">Sesión Seleccionada</h4>
                                <p id="selectedDateTime">Fecha y Hora</p>
                                <div class="total-price" id="totalPrice">€0</div>
                            </div>
                        </div>
                        
                        <form id="bookingForm" class="booking-form">
                            <div class="form-group">
                                <label for="clientName">Nombre Completo</label>
                                <input type="text" id="clientName" required>
                            </div>
                            <div class="form-group">
                                <label for="clientEmail">Email</label>
                                <input type="email" id="clientEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="clientPhone">WhatsApp</label>
                                <input type="tel" id="clientPhone" required>
                            </div>
                            <div class="form-group">
                                <label for="clientTimezone">Zona Horaria</label>
                                <select id="clientTimezone" required>
                                    <option value="">Selecciona tu zona horaria</option>
                                    <option value="Europe/Madrid">España (CET)</option>
                                    <option value="America/Mexico_City">México (CST)</option>
                                    <option value="America/Argentina/Buenos_Aires">Argentina (ART)</option>
                                    <option value="America/Bogota">Colombia (COT)</option>
                                    <option value="America/Lima">Perú (PET)</option>
                                    <option value="America/New_York">USA Este (EST)</option>
                                    <option value="America/Los_Angeles">USA Oeste (PST)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="clientMessage">¿Qué quieres transformar?</label>
                                <textarea id="clientMessage" rows="3" placeholder="Cuéntame brevemente qué te gustaría trabajar en nuestras sesiones..."></textarea>
                            </div>
                            
                            <div class="payment-section" id="paymentSection">
                                <h4><i class="fas fa-credit-card"></i> Pago Seguro</h4>
                                <div class="payment-methods">
                                    <button type="button" class="payment-btn" data-method="stripe">
                                        <i class="fab fa-stripe"></i>
                                        Tarjeta de Crédito
                                    </button>
                                    <button type="button" class="payment-btn" data-method="paypal">
                                        <i class="fab fa-paypal"></i>
                                        PayPal
                                    </button>
                                </div>
                            </div>
                            
                            <button type="submit" class="confirm-booking-btn">
                                <i class="fas fa-calendar-check"></i>
                                Confirmar Sesión Transformadora
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    createAdminPanel() {
        const adminHTML = `
            <div id="adminPanel" class="admin-panel">
                <div class="admin-header">
                    <h3><i class="fas fa-cog"></i> Panel de Control - Luis</h3>
                    <button onclick="agendaSystem.toggleAdmin()" class="admin-close">&times;</button>
                </div>
                
                <div class="admin-tabs">
                    <button class="admin-tab active" onclick="agendaSystem.showAdminTab('horarios')">Mis Horarios</button>
                    <button class="admin-tab" onclick="agendaSystem.showAdminTab('sesiones')">Sesiones Agendadas</button>
                    <button class="admin-tab" onclick="agendaSystem.showAdminTab('ingresos')">Ingresos</button>
                </div>
                
                <!-- Gestión de Horarios -->
                <div id="adminHorarios" class="admin-content active">
                    <div class="admin-actions">
                        <h4>Agregar Horarios Disponibles</h4>
                        <div class="quick-actions">
                            <button onclick="agendaSystem.addDefaultWeekSchedule()" class="action-btn">
                                <i class="fas fa-plus"></i> Semana Completa
                            </button>
                            <button onclick="agendaSystem.addCustomSlot()" class="action-btn">
                                <i class="fas fa-clock"></i> Horario Específico
                            </button>
                        </div>
                        <div class="schedule-list" id="scheduleList">
                            <!-- Lista de horarios disponibles -->
                        </div>
                    </div>
                </div>
                
                <!-- Sesiones Agendadas -->
                <div id="adminSesiones" class="admin-content">
                    <h4>Próximas Sesiones</h4>
                    <div class="sessions-list" id="sessionsList">
                        <!-- Lista de sesiones -->
                    </div>
                </div>
                
                <!-- Ingresos -->
                <div id="adminIngresos" class="admin-content">
                    <h4>Resumen de Ingresos</h4>
                    <div class="income-stats">
                        <div class="stat-card">
                            <h5>Este Mes</h5>
                            <span class="amount" id="monthlyIncome">€0</span>
                        </div>
                        <div class="stat-card">
                            <h5>Total</h5>
                            <span class="amount" id="totalIncome">€0</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Botón Admin (oculto para clientes) -->
            <button id="adminToggle" class="admin-toggle" onclick="agendaSystem.toggleAdmin()">
                <i class="fas fa-user-cog"></i>
            </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', adminHTML);
    }

    bindEvents() {
        // Abrir modal desde botones CTA
        document.querySelectorAll('[href="#sesion"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        });

        // Selección de tipo de sesión
        document.addEventListener('click', (e) => {
            if (e.target.closest('.session-type')) {
                this.selectSessionType(e.target.closest('.session-type'));
            }
        });

        // Navegación entre pasos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-step')) {
                this.nextStep();
            }
            if (e.target.classList.contains('prev-step')) {
                this.prevStep();
            }
        });

        // Submit del formulario
        document.getElementById('bookingForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processBooking();
        });
    }

    openModal() {
        console.log('Abriendo modal de agenda...');
        if (!this.modal) {
            console.error('Modal no encontrado');
            return;
        }
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.currentStep = 1;
        this.showStep(1);
        this.renderCalendar();
        console.log('Modal abierto correctamente');
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetSteps();
    }

    selectSessionType(element) {
        // Limpiar selección anterior
        document.querySelectorAll('.session-type').forEach(el => el.classList.remove('selected'));
        
        // Seleccionar nuevo
        element.classList.add('selected');
        
        // Guardar selección
        this.selectedSessionType = element.dataset.type;
        
        // Avanzar al siguiente paso
        setTimeout(() => this.goToStep(2), 500);
    }

    goToStep(stepNumber) {
        // Actualizar indicadores de pasos
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index === stepNumber - 1) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Mostrar paso correspondiente
        document.querySelectorAll('.agenda-step').forEach((step, index) => {
            if (index === stepNumber - 1) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        if (stepNumber === 2) {
            this.renderCalendar();
        } else if (stepNumber === 3) {
            this.renderBookingSummary();
        }
    }

    renderCalendar() {
        const calendar = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('currentMonthYear');
        
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        monthYear.textContent = this.currentMonth.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
        });

        // Generar días del calendario
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let calendarHTML = `
            <div class="calendar-weekdays">
                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div>
                <div>Jue</div><div>Vie</div><div>Sáb</div>
            </div>
            <div class="calendar-days">
        `;

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === new Date().toDateString();
            const hasAvailability = this.hasAvailableSlots(date);
            const isPast = date < new Date().setHours(0, 0, 0, 0);

            calendarHTML += `
                <div class="calendar-day ${isCurrentMonth ? '' : 'other-month'} 
                     ${isToday ? 'today' : ''} 
                     ${hasAvailability && !isPast ? 'available' : ''} 
                     ${isPast ? 'past' : ''}"
                     data-date="${date.toISOString().split('T')[0]}"
                     onclick="${hasAvailability && !isPast ? 'agendaSystem.selectDate(this)' : ''}">
                    ${date.getDate()}
                    ${hasAvailability && !isPast ? '<div class="availability-dot"></div>' : ''}
                </div>
            `;
        }

        calendarHTML += '</div>';
        calendar.innerHTML = calendarHTML;
    }

    hasAvailableSlots(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.horariosDisponibles[dateStr] && this.horariosDisponibles[dateStr].length > 0;
    }

    selectDate(element) {
        // Limpiar selección anterior
        document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
        element.classList.add('selected');
        
        const selectedDate = element.dataset.date;
        this.selectedDate = selectedDate;
        
        // Mostrar horarios disponibles
        this.renderTimeSlots(selectedDate);
    }

    renderTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('timeSlots');
        const slots = this.horariosDisponibles[date] || [];
        
        if (slots.length === 0) {
            timeSlotsContainer.innerHTML = '<p>No hay horarios disponibles para este día</p>';
            return;
        }

        let slotsHTML = '<h5>Horarios Disponibles:</h5><div class="time-grid">';
        
        slots.forEach(slot => {
            const isBooked = this.isSlotBooked(date, slot);
            if (!isBooked) {
                slotsHTML += `
                    <button class="time-slot" 
                            onclick="agendaSystem.selectTimeSlot('${slot}', this)"
                            data-time="${slot}">
                        ${slot}
                    </button>
                `;
            }
        });
        
        slotsHTML += '</div>';
        timeSlotsContainer.innerHTML = slotsHTML;
    }

    selectTimeSlot(time, element) {
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
        element.classList.add('selected');
        
        this.selectedTime = time;
        this.selectedSlot = `${this.selectedDate} ${time}`;
        
        // Avanzar al paso 3 después de un breve delay
        setTimeout(() => this.goToStep(3), 500);
    }

    renderBookingSummary() {
        const sessionInfo = this.precios[this.selectedSessionType];
        const date = new Date(this.selectedDate);
        const formattedDate = date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('selectedSession').textContent = sessionInfo.nombre;
        document.getElementById('selectedDateTime').textContent = `${formattedDate} a las ${this.selectedTime}`;
        document.getElementById('totalPrice').textContent = `€${sessionInfo.precio}`;
        
        // Ocultar sección de pago si es sesión gratuita
        const paymentSection = document.getElementById('paymentSection');
        if (sessionInfo.precio === 0) {
            paymentSection.style.display = 'none';
        } else {
            paymentSection.style.display = 'block';
        }
    }

    processBooking() {
        const formData = new FormData(document.getElementById('bookingForm'));
        const bookingData = {
            sessionType: this.selectedSessionType,
            date: this.selectedDate,
            time: this.selectedTime,
            name: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value,
            timezone: document.getElementById('clientTimezone').value,
            message: document.getElementById('clientMessage').value,
            price: this.precios[this.selectedSessionType].precio
        };

        // Simular proceso de reserva
        this.showLoadingState();
        
        setTimeout(() => {
            this.confirmBooking(bookingData);
        }, 2000);
    }

    showLoadingState() {
        const submitBtn = document.querySelector('.confirm-booking-btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando tu reserva...';
        submitBtn.disabled = true;
    }

    confirmBooking(data) {
        // Agregar a sesiones agendadas
        this.sesionesAgendadas.push({
            ...data,
            id: Date.now(),
            status: 'confirmada',
            bookedAt: new Date().toISOString()
        });
        
        // Remover horario de disponibles
        if (this.horariosDisponibles[data.date]) {
            this.horariosDisponibles[data.date] = this.horariosDisponibles[data.date].filter(time => time !== data.time);
        }
        
        // Guardar en localStorage
        this.saveData();
        
        // Mostrar confirmación
        this.showBookingConfirmation(data);
    }

    showBookingConfirmation(data) {
        const modal = document.getElementById('agendaModal');
        modal.innerHTML = `
            <div class="agenda-modal-content confirmation">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>¡Sesión Confirmada!</h2>
                <div class="confirmation-details">
                    <p><strong>${this.precios[data.sessionType].nombre}</strong></p>
                    <p><i class="fas fa-calendar"></i> ${new Date(data.date).toLocaleDateString('es-ES', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}</p>
                    <p><i class="fas fa-clock"></i> ${data.time}</p>
                    <p><i class="fas fa-envelope"></i> Recibirás un email de confirmación</p>
                </div>
                <div class="next-steps">
                    <h4>Próximos pasos:</h4>
                    <ol>
                        <li>Revisa tu email para los detalles de la sesión</li>
                        <li>Agrega la cita a tu calendario</li>
                        <li>Prepara las preguntas que quieras hacer</li>
                    </ol>
                </div>
                <button onclick="agendaSystem.closeModal()" class="btn btn-primary">
                    Perfecto, ¡nos vemos pronto!
                </button>
            </div>
        `;
    }

    // Funciones del Panel Admin
    toggleAdmin() {
        const panel = document.getElementById('adminPanel');
        panel.classList.toggle('active');
        this.updateAdminData();
    }

    showAdminTab(tabName) {
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[onclick="agendaSystem.showAdminTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    }

    addDefaultWeekSchedule() {
        const startDate = new Date();
        for (let i = 0; i < 30; i++) { // Próximos 30 días
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (date.getDay() !== 0 && date.getDay() !== 6) { // No domingos ni sábados
                this.horariosDisponibles[dateStr] = [
                    '09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30'
                ];
            }
        }
        this.saveData();
        this.updateAdminData();
        alert('Horarios agregados para los próximos 30 días laborales');
    }

    addCustomSlot() {
        const date = prompt('Fecha (YYYY-MM-DD):');
        const time = prompt('Hora (HH:MM):');
        
        if (date && time) {
            if (!this.horariosDisponibles[date]) {
                this.horariosDisponibles[date] = [];
            }
            this.horariosDisponibles[date].push(time);
            this.saveData();
            this.updateAdminData();
            alert('Horario agregado exitosamente');
        }
    }

    updateAdminData() {
        // Actualizar lista de horarios
        const scheduleList = document.getElementById('scheduleList');
        let scheduleHTML = '';
        
        Object.entries(this.horariosDisponibles).forEach(([date, times]) => {
            if (times.length > 0) {
                scheduleHTML += `
                    <div class="schedule-item">
                        <strong>${new Date(date).toLocaleDateString('es-ES')}</strong>
                        <div class="time-tags">
                            ${times.map(time => `
                                <span class="time-tag">
                                    ${time}
                                    <button onclick="agendaSystem.removeTimeSlot('${date}', '${time}')" class="remove-time">×</button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        scheduleList.innerHTML = scheduleHTML || '<p>No hay horarios disponibles</p>';
        
        // Actualizar lista de sesiones
        const sessionsList = document.getElementById('sessionsList');
        const upcomingSessions = this.sesionesAgendadas
            .filter(session => new Date(`${session.date}T${session.time}`) > new Date())
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        
        let sessionsHTML = '';
        upcomingSessions.forEach(session => {
            sessionsHTML += `
                <div class="session-item">
                    <div class="session-info">
                        <strong>${session.name}</strong>
                        <p>${this.precios[session.sessionType].nombre}</p>
                        <p><i class="fas fa-calendar"></i> ${new Date(session.date).toLocaleDateString('es-ES')} ${session.time}</p>
                        <p><i class="fas fa-envelope"></i> ${session.email}</p>
                    </div>
                    <div class="session-actions">
                        <button onclick="agendaSystem.contactClient('${session.email}')" class="action-btn">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button onclick="agendaSystem.cancelSession(${session.id})" class="action-btn cancel">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        sessionsList.innerHTML = sessionsHTML || '<p>No hay sesiones programadas</p>';
        
        // Actualizar ingresos
        const monthlyIncome = this.calculateMonthlyIncome();
        const totalIncome = this.calculateTotalIncome();
        
        document.getElementById('monthlyIncome').textContent = `€${monthlyIncome}`;
        document.getElementById('totalIncome').textContent = `€${totalIncome}`;
    }

    removeTimeSlot(date, time) {
        if (this.horariosDisponibles[date]) {
            this.horariosDisponibles[date] = this.horariosDisponibles[date].filter(t => t !== time);
            if (this.horariosDisponibles[date].length === 0) {
                delete this.horariosDisponibles[date];
            }
        }
        this.saveData();
        this.updateAdminData();
    }

    calculateMonthlyIncome() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.sesionesAgendadas
            .filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate.getMonth() === currentMonth && 
                       sessionDate.getFullYear() === currentYear &&
                       session.status === 'confirmada';
            })
            .reduce((total, session) => total + session.price, 0);
    }

    calculateTotalIncome() {
        return this.sesionesAgendadas
            .filter(session => session.status === 'confirmada')
            .reduce((total, session) => total + session.price, 0);
    }

    // Funciones de almacenamiento
    loadHorarios() {
        const stored = localStorage.getItem('luisVirrueta_horarios');
        return stored ? JSON.parse(stored) : {};
    }

    loadSesiones() {
        const stored = localStorage.getItem('luisVirrueta_sesiones');
        return stored ? JSON.parse(stored) : [];
    }

    saveData() {
        localStorage.setItem('luisVirrueta_horarios', JSON.stringify(this.horariosDisponibles));
        localStorage.setItem('luisVirrueta_sesiones', JSON.stringify(this.sesionesAgendadas));
    }

    isSlotBooked(date, time) {
        return this.sesionesAgendadas.some(session => 
            session.date === date && 
            session.time === time && 
            session.status === 'confirmada'
        );
    }

    showStep(stepNumber) {
        // Ocultar todos los pasos
        const steps = this.modal.querySelectorAll('.agenda-step');
        steps.forEach(step => step.classList.remove('active'));
        
        // Mostrar el paso actual
        const currentStep = this.modal.querySelector(`#step${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
        
        // Actualizar indicadores de pasos
        const stepIndicators = this.modal.querySelectorAll('.step');
        stepIndicators.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else if (index + 1 < stepNumber) {
                step.classList.add('completed');
            }
        });
        
        this.currentStep = stepNumber;
    }

    goToStep(stepNumber) {
        this.showStep(stepNumber);
    }

    resetSteps() {
        this.selectedSessionType = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedSlot = null;
        this.goToStep(1);
    }

    previousMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
    }

    contactClient(email) {
        window.open(`mailto:${email}?subject=Sobre tu sesión transformadora`);
    }

    cancelSession(sessionId) {
        if (confirm('¿Estás seguro de cancelar esta sesión?')) {
            this.sesionesAgendadas = this.sesionesAgendadas.filter(session => session.id !== sessionId);
            this.saveData();
            this.updateAdminData();
        }
    }
}

// Inicializar el sistema cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
    window.agendaSystem = new AgendaTransformadora();
});
