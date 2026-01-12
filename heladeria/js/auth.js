// Sistema de autenticación y almacenamiento de usuarios

// Clase para manejar la autenticación
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('heladeria_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('heladeria_current_user')) || null;
        
        // Verificar si hay un usuario recordado
        this.checkRememberedUser();
        
        // Configurar event listeners para formularios
        this.setupEventListeners();
    }
    
    // Verificar si hay un usuario recordado
    checkRememberedUser() {
        const rememberedEmail = localStorage.getItem('heladeria_remembered_email');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('remember').checked = true;
        }
    }
    
    // Configurar event listeners
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Actualizar UI basado en estado de autenticación
        this.updateAuthUI();
    }
    
    // Manejar inicio de sesión
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validar campos
        if (!email || !password) {
            this.showMessage('Por favor, completa todos los campos', 'error');
            return;
        }
        
        // Buscar usuario
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Iniciar sesión
            this.currentUser = user;
            localStorage.setItem('heladeria_current_user', JSON.stringify(user));
            
            // Recordar email si está marcado
            if (remember) {
                localStorage.setItem('heladeria_remembered_email', email);
            } else {
                localStorage.removeItem('heladeria_remembered_email');
            }
            
            this.showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            this.updateAuthUI();
            
            // Cerrar modal después de 1.5 segundos
            setTimeout(() => {
                document.getElementById('loginModal').classList.remove('active');
                document.body.style.overflow = 'auto';
                
                // Resetear formularios
                document.getElementById('loginForm').reset();
                document.getElementById('registerForm').reset();
                document.getElementById('registerForm').classList.add('hidden');
                document.getElementById('loginForm').classList.remove('hidden');
            }, 1500);
        } else {
            this.showMessage('Email o contraseña incorrectos', 'error');
        }
    }
    
    // Manejar registro
    handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const terms = document.getElementById('terms').checked;
        
        // Validar campos
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage('Por favor, completa todos los campos', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (!terms) {
            this.showMessage('Debes aceptar los términos y condiciones', 'error');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('Por favor, introduce un email válido', 'error');
            return;
        }
        
        // Verificar si el usuario ya existe
        const existingUser = this.users.find(u => u.email === email);
        if (existingUser) {
            this.showMessage('Este email ya está registrado', 'error');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            registrationDate: new Date().toISOString()
        };
        
        // Agregar usuario
        this.users.push(newUser);
        localStorage.setItem('heladeria_users', JSON.stringify(this.users));
        
        // Iniciar sesión automáticamente
        this.currentUser = newUser;
        localStorage.setItem('heladeria_current_user', JSON.stringify(newUser));
        
        this.showMessage('¡Registro exitoso! Bienvenido/a ' + name, 'success');
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            document.getElementById('loginModal').classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Resetear formularios
            document.getElementById('loginForm').reset();
            document.getElementById('registerForm').reset();
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        }, 2000);
    }
    
    // Mostrar mensaje
    showMessage(message, type) {
        const messageElement = document.getElementById('loginMessage');
        messageElement.textContent = message;
        messageElement.className = 'login-message';
        
        if (type === 'success') {
            messageElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            messageElement.style.color = '#4CAF50';
        } else if (type === 'error') {
            messageElement.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            messageElement.style.color = '#F44336';
        }
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.style.backgroundColor = '';
        }, 5000);
    }
    
    // Cerrar sesión
    logout() {
        this.currentUser = null;
        localStorage.removeItem('heladeria_current_user');
        this.updateAuthUI();
        this.showMessage('Sesión cerrada correctamente', 'success');
    }
    
    // Actualizar UI basado en estado de autenticación
    updateAuthUI() {
        const loginButtons = document.querySelectorAll('#openLoginModal, #openLoginModalDesktop');
        const userMenu = document.getElementById('userMenu');
        
        if (this.currentUser) {
            // Usuario autenticado
            loginButtons.forEach(btn => {
                if (btn.tagName === 'BUTTON') {
                    btn.textContent = `Hola, ${this.currentUser.name.split(' ')[0]}`;
                    btn.onclick = () => this.logout();
                } else if (btn.tagName === 'A') {
                    btn.textContent = `Cerrar Sesión (${this.currentUser.name.split(' ')[0]})`;
                    btn.href = '#';
                    btn.onclick = (e) => {
                        e.preventDefault();
                        this.logout();
                    };
                }
            });
        } else {
            // Usuario no autenticado
            loginButtons.forEach(btn => {
                if (btn.tagName === 'BUTTON') {
                    btn.textContent = 'Iniciar Sesión';
                    btn.onclick = (e) => {
                        e.preventDefault();
                        document.getElementById('loginModal').classList.add('active');
                        document.body.style.overflow = 'hidden';
                    };
                } else if (btn.tagName === 'A') {
                    btn.textContent = 'Iniciar Sesión';
                    btn.href = '#';
                    btn.onclick = (e) => {
                        e.preventDefault();
                        document.getElementById('loginModal').classList.add('active');
                        document.body.style.overflow = 'hidden';
                    };
                }
            });
        }
    }
}

// Inicializar el sistema de autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const authSystem = new AuthSystem();
    
    // Exponer authSystem globalmente para poder acceder desde la consola si es necesario
    window.authSystem = authSystem;
});