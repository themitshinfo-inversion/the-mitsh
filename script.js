/**
 * BLOCKCHAIN LIMA 2026 — THE MITSH
 * Experiencia Audiovisual Cinematográfica (Vanilla JS Puro)
 * 
 * Flujo:
 * 1. Entrada exclusiva en video fullscreen con cuenta regresiva superpuesta.
 * 2. Manejo de reproducción automática con pantalla mínima de respaldo (fallback).
 * 3. Detección de finalización del video (evento 'ended') para transición cinematográfica.
 * 4. Revelación del contenido del evento (BLOCKCHAIN LIMA 2026, ponentes, info, registro).
 * 5. Contador regresivo en tiempo real calculado para el 18 de noviembre de 2026 a las 2:00 p. m. (Lima).
 * 6. Validación de formulario e integración preparada para Google Apps Script.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     CONFIGURACIÓN PARA GOOGLE APPS SCRIPT
     ========================================================================== */
  /**
   * Endpoint oficial de Google Apps Script vinculado a Google Sheets (Columnas A - I)
   */
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyl-m71IuqxEksDWKyzCEqivX-8EqgiViNKdTLgBVrN4dYrJe_xu04nnm0fBYvBn6SBXw/exec';

  /* ==========================================================================
     1. GESTIÓN DEL VIDEO FULLSCREEN Y EVENTO DE FINALIZACIÓN
     ========================================================================== */
  const introScreen = document.getElementById('introScreen');
  const introVideo = document.getElementById('introVideo');
  const videoFallbackPrompt = document.getElementById('videoFallbackPrompt');
  const btnStartVideo = document.getElementById('btnStartVideo');
  const eventMainContent = document.getElementById('eventMainContent');
  const introSoundToggle = document.getElementById('introSoundToggle');
  const introSoundText = document.getElementById('introSoundText');
  const introIconMuted = document.getElementById('introIconMuted');
  const introIconUnmuted = document.getElementById('introIconUnmuted');
  const btnSkipIntro = document.getElementById('btnSkipIntro');
  const mainBgVideo = document.getElementById('mainBgVideo');

  let hasRevealed = false;

  // Función de revelación cinematográfica del contenido del evento
  function revealEventContent() {
    if (hasRevealed) return;
    hasRevealed = true;

    // Pausar video de entrada
    if (introVideo) {
      try { introVideo.pause(); } catch (e) {}
    }

    // Iniciar video de fondo en bucle con velo oscuro y desenfoque
    if (mainBgVideo) {
      mainBgVideo.muted = true;
      mainBgVideo.play().catch(e => {
        console.warn('Reproducción de video de fondo bloqueada:', e);
      });
    }

    // Iniciar sistema de fuego azul y partículas ascendentes
    initBlueParticles();

    // Efecto de desvanecimiento cinematográfico
    if (introScreen) {
      introScreen.classList.add('fade-out');
    }

    setTimeout(() => {
      // Ocultar pantalla de video y liberar scroll
      if (introScreen) {
        introScreen.classList.add('hidden');
      }
      document.body.classList.remove('intro-active');

      // Revelar contenido principal con fondo activo
      if (eventMainContent) {
        eventMainContent.classList.add('content-revealed');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 1000);
  }

  // Reproducción automática del video al cargar
  if (introVideo) {
    introVideo.muted = true; // Requerido por políticas de autoplay de los navegadores

    const playPromise = introVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Reproducción automática restringida por el navegador. Activando pantalla mínima:', error);
        // Mostrar pantalla mínima de inicio sin revelar datos del evento
        if (videoFallbackPrompt) {
          videoFallbackPrompt.style.display = 'flex';
        }
      });
    }

    // Evento clave: cuando el video termina, se revela automáticamente la información
    introVideo.addEventListener('ended', () => {
      revealEventContent();
    });

    // En caso de error de red o carga en el video, permitir revelar para no bloquear al usuario
    introVideo.addEventListener('error', () => {
      console.warn('Error al cargar el video de Cloudinary. Revelando contenido...');
      revealEventContent();
    });
  }

  // Botón de la pantalla mínima de respaldo (fallback)
  if (btnStartVideo && introVideo) {
    btnStartVideo.addEventListener('click', () => {
      if (videoFallbackPrompt) {
        videoFallbackPrompt.style.display = 'none';
      }
      introVideo.play().catch(e => {
        console.error('No se pudo reproducir el video tras clic:', e);
        revealEventContent();
      });
    });
  }

  // Control discreto de sonido durante el video
  if (introSoundToggle && introVideo) {
    introSoundToggle.addEventListener('click', () => {
      if (introVideo.muted) {
        introVideo.muted = false;
        introSoundText.textContent = 'Silenciar';
        introIconMuted.classList.remove('active');
        introIconUnmuted.classList.add('active');
      } else {
        introVideo.muted = true;
        introSoundText.textContent = 'Activar Audio';
        introIconUnmuted.classList.remove('active');
        introIconMuted.classList.add('active');
      }
    });
  }

  // Control del botón "Omitir Intro" condicionado a 30 segundos de reproducción
  const SKIP_THRESHOLD_SECONDS = 30;

  if (introVideo && btnSkipIntro) {
    // Controlar visibilidad y disponibilidad mediante el evento timeupdate
    introVideo.addEventListener('timeupdate', () => {
      if (introVideo.currentTime >= SKIP_THRESHOLD_SECONDS) {
        if (!btnSkipIntro.classList.contains('visible')) {
          btnSkipIntro.classList.add('visible');
          btnSkipIntro.removeAttribute('disabled');
        }
      } else {
        // Se reinicia si el video vuelve a empezar o su currentTime es menor a 30s
        if (btnSkipIntro.classList.contains('visible')) {
          btnSkipIntro.classList.remove('visible');
          btnSkipIntro.setAttribute('disabled', 'true');
        }
      }
    });

    // Acción del botón Omitir: solo permite saltar si currentTime >= 30s
    btnSkipIntro.addEventListener('click', () => {
      if (introVideo.currentTime >= SKIP_THRESHOLD_SECONDS) {
        revealEventContent();
      }
    });
  }

  /* ==========================================================================
     SISTEMA DE PARTÍCULAS Y CHISPAS DE FUEGO AZUL
     ========================================================================== */
  let particlesInitialized = false;

  function initBlueParticles() {
    if (particlesInitialized) return;
    particlesInitialized = true;

    const canvas = document.getElementById('blueParticlesCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 22 : 48;
    const particles = [];

    const colors = [
      'rgba(0, 240, 255, ',    // Cyan puro
      'rgba(56, 189, 248, ',   // Azul eléctrico brillante
      'rgba(0, 112, 243, ',    // Azul zafiro
      'rgba(147, 197, 253, '   // Destello azul claro
    ];

    class BlueParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + Math.random() * 20;
        this.radius = Math.random() * 2.2 + 0.8;
        this.speedY = Math.random() * 0.7 + 0.35; // Ascenso lento
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.maxAlpha = Math.random() * 0.65 + 0.3;
        this.alpha = 0;
        this.life = 0;
        this.maxLife = Math.random() * 320 + 200;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
      }

      update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.45 + this.speedX;

        this.life++;

        // Curva suave de aparición y desaparición de destello
        const progress = this.life / this.maxLife;
        if (progress < 0.2) {
          this.alpha = (progress / 0.2) * this.maxAlpha;
        } else if (progress > 0.7) {
          this.alpha = ((1 - progress) / 0.3) * this.maxAlpha;
        } else {
          this.alpha = this.maxAlpha;
        }

        if (this.y < -20 || this.life >= this.maxLife) {
          this.reset(false);
        }
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.alpha + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f0ff';
        ctx.fill();
        ctx.closePath();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new BlueParticle());
    }

    let isPaused = false;

    function renderParticles() {
      if (!isPaused) {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
      }
      requestAnimationFrame(renderParticles);
    }

    requestAnimationFrame(renderParticles);

    // Optimización: pausar ciclo cuando la pestaña esté inactiva
    document.addEventListener('visibilitychange', () => {
      isPaused = document.hidden;
    });
  }

  /* ==========================================================================
     2. CUENTA REGRESIVA
     Fecha objetivo: 18 de noviembre de 2026, 2:00 p. m., hora de Lima (UTC-5)
     ========================================================================== */
  const eventTargetTime = new Date('2026-11-18T14:00:00-05:00').getTime();

  // Elementos de la cuenta regresiva superpuesta al video
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  // Elementos de la cuenta regresiva en el contenido revelado
  const revealedDays = document.getElementById('revealedDays');
  const revealedHours = document.getElementById('revealedHours');
  const revealedMinutes = document.getElementById('revealedMinutes');
  const revealedSeconds = document.getElementById('revealedSeconds');

  function updateCountdowns() {
    const now = new Date().getTime();
    const difference = eventTargetTime - now;

    if (difference <= 0) {
      applyCountdownDigits('00', '00', '00', '00');
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const dStr = String(days).padStart(2, '0');
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    applyCountdownDigits(dStr, hStr, mStr, sStr);
  }

  function applyCountdownDigits(d, h, m, s) {
    // Cuenta regresiva del video
    if (cdDays) cdDays.textContent = d;
    if (cdHours) cdHours.textContent = h;
    if (cdMinutes) cdMinutes.textContent = m;
    if (cdSeconds) cdSeconds.textContent = s;

    // Cuenta regresiva en la información revelada
    if (revealedDays) revealedDays.textContent = d;
    if (revealedHours) revealedHours.textContent = h;
    if (revealedMinutes) revealedMinutes.textContent = m;
    if (revealedSeconds) revealedSeconds.textContent = s;
  }

  updateCountdowns();
  setInterval(updateCountdowns, 1000);

  /* ==========================================================================
     3. FORMULARIO DE INSCRIPCIÓN & ESTRUCTURA GOOGLE APPS SCRIPT
     ========================================================================== */
  const registrationForm = document.getElementById('registrationForm');
  const formAlert = document.getElementById('formAlert');
  const btnSubmitForm = document.getElementById('btnSubmitForm');
  const btnText = btnSubmitForm ? btnSubmitForm.querySelector('.btn-text') : null;
  const btnSpinner = btnSubmitForm ? btnSubmitForm.querySelector('.btn-spinner') : null;
  const fechaRegistroInput = document.getElementById('fechaRegistro');

  const nombresInput = document.getElementById('nombres');
  const apellidosInput = document.getElementById('apellidos');
  const emailInput = document.getElementById('email');
  const whatsappInput = document.getElementById('whatsapp');
  const metodoPagoSelect = document.getElementById('metodoPago');

  const errorNombres = document.getElementById('errorNombres');
  const errorApellidos = document.getElementById('errorApellidos');
  const errorEmail = document.getElementById('errorEmail');
  const errorWhatsapp = document.getElementById('errorWhatsapp');
  const errorMetodoPago = document.getElementById('errorMetodoPago');

  function resetFormErrors() {
    [errorNombres, errorApellidos, errorEmail, errorWhatsapp, errorMetodoPago].forEach(el => {
      if (el) el.textContent = '';
    });
    [nombresInput, apellidosInput, emailInput, whatsappInput, metodoPagoSelect].forEach(input => {
      if (input) input.classList.remove('input-error');
    });
    if (formAlert) {
      formAlert.style.display = 'none';
      formAlert.className = 'form-alert';
      formAlert.textContent = '';
    }
  }

  function displayAlert(message, type = 'info') {
    if (!formAlert) return;
    formAlert.textContent = message;
    formAlert.className = `form-alert ${type}`;
    formAlert.style.display = 'block';
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return phone.replace(/[^\d+]/g, '').length >= 8;
  }

  function validateRegistration() {
    resetFormErrors();
    let valid = true;

    if (!nombresInput.value.trim()) {
      errorNombres.textContent = 'Por favor, ingresa tus nombres.';
      nombresInput.classList.add('input-error');
      valid = false;
    }

    if (!apellidosInput.value.trim()) {
      errorApellidos.textContent = 'Por favor, ingresa tus apellidos.';
      apellidosInput.classList.add('input-error');
      valid = false;
    }

    if (!emailInput.value.trim()) {
      errorEmail.textContent = 'Por favor, ingresa tu correo electrónico.';
      emailInput.classList.add('input-error');
      valid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      errorEmail.textContent = 'Formato de correo inválido (ej: nombre@correo.com).';
      emailInput.classList.add('input-error');
      valid = false;
    }

    if (!whatsappInput.value.trim()) {
      errorWhatsapp.textContent = 'Por favor, ingresa tu número de WhatsApp.';
      whatsappInput.classList.add('input-error');
      valid = false;
    } else if (!isValidPhone(whatsappInput.value.trim())) {
      errorWhatsapp.textContent = 'Ingresa un número telefónico válido (mínimo 8 dígitos).';
      whatsappInput.classList.add('input-error');
      valid = false;
    }

    if (!metodoPagoSelect.value) {
      errorMetodoPago.textContent = 'Selecciona tu método de pago preferido.';
      metodoPagoSelect.classList.add('input-error');
      valid = false;
    }

    return valid;
  }

  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateRegistration()) {
        displayAlert('Por favor, completa correctamente todos los campos obligatorios.', 'error');
        return;
      }

      // Prevención de doble clic y feedback visual inmediato
      btnSubmitForm.disabled = true;
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'Procesando inscripción...';

      // Marca de tiempo exacta del registro (Hora de Lima)
      const ahoraLima = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
      if (fechaRegistroInput) {
        fechaRegistroInput.value = ahoraLima;
      }

      const nombresVal = nombresInput ? nombresInput.value.trim() : '';
      const apellidosVal = apellidosInput ? apellidosInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const whatsappVal = whatsappInput ? whatsappInput.value.trim() : '';
      const metodoPagoVal = metodoPagoSelect ? metodoPagoSelect.value : '';

      // Payload alineado exactamente con las columnas A hasta I de Google Sheets:
      // A: fecha | B: nombres | C: apellidos | D: correo | E: WhatsApp | F: método de pago | G: importe | H: evento | I: estado de pago
      const payload = {
        // Columnas A hasta I (claves canónicas)
        fecha: ahoraLima,
        nombres: nombresVal,
        apellidos: apellidosVal,
        correo: emailVal,
        whatsapp: whatsappVal,
        metodoPago: metodoPagoVal,
        importe: 'S/ 75.00',
        evento: 'BLOCKCHAIN LIMA 2026',
        estadoPago: 'Pendiente',

        // Alias y sinónimos adicionales para compatibilidad con variaciones en Apps Script
        email: emailVal,
        telefono: whatsappVal,
        celular: whatsappVal,
        nombre: nombresVal,
        apellido: apellidosVal,
        metodo_pago: metodoPagoVal,
        metodo: metodoPagoVal,
        pago: metodoPagoVal,
        monto: 'S/ 75.00',
        precio: 'S/ 75.00',
        estado: 'Pendiente',
        status: 'Pendiente',
        fechaRegistro: ahoraLima
      };

      try {
        // Petición POST con Content-Type: text/plain para evitar bloqueos CORS y permitir lectura de JSON
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        // Verificación estricta de confirmación de Google Sheets (sin simular registros)
        if (result && (result.success === true || result.status === 'success')) {
          displayAlert(
            '¡Inscripción registrada con éxito! Tu lugar para BLOCKCHAIN Lima 2026 ha sido reservado. En breve recibirás las instrucciones de pago a tu correo y WhatsApp.',
            'success'
          );
          registrationForm.reset();
        } else {
          const mensajeError = (result && result.message) 
            ? result.message 
            : 'No se pudo confirmar el registro en Google Sheets. Por favor verifica tus datos e inténtalo nuevamente.';
          displayAlert(`Error: ${mensajeError}`, 'error');
        }
      } catch (err) {
        console.error('Error de conexión con Google Apps Script:', err);
        displayAlert(
          'Error de conexión al enviar el formulario. Por favor revisa tu conexión a internet o intenta nuevamente en unos momentos.',
          'error'
        );
      } finally {
        btnSubmitForm.disabled = false;
        if (btnSpinner) btnSpinner.style.display = 'none';
        if (btnText) btnText.textContent = 'INSCRIBIRME — S/ 75';
      }
    });
  }

});
