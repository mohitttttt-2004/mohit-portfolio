document.addEventListener('DOMContentLoaded', () => {

  // --- CUSTOM CURSOR GLOW ---
  const cursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('customCursorDot');

  if (cursor && cursorDot) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    // Hide default cursor on desktop & handle tracking
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Instant position for the inner dot
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth trailing effect for outer circle
    const renderCursor = () => {
      const ease = 0.15;
      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    // Add hover states for interactive items
    const interactives = document.querySelectorAll('a, button, .contact-card, .form-control, .btn');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '45px';
        cursor.style.height = '45px';
        cursor.style.backgroundColor = 'rgba(229, 192, 96, 0.1)';
        cursor.style.borderColor = '#e5c060';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.backgroundColor = 'transparent';
        cursor.style.borderColor = '#e5c060';
      });
    });

    // Hide cursor if mouse leaves window
    document.addEventListener('mouseleave', () => {
      cursor.style.display = 'none';
      cursorDot.style.display = 'none';
    });

    document.addEventListener('mouseenter', () => {
      cursor.style.display = 'block';
      cursorDot.style.display = 'block';
    });
  }

  // --- NAVBAR SCROLL STATE ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- MOBILE NAVIGATION BAR TOGGLE ---
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      mobileNavToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking nav link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // --- INTERSECTION OBSERVER REVEAL ANIMATIONS ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve to keep element visible once animated
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- ACTIVE LINK SELECTION ON SCROLL ---
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');

  const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-10% 0px -60% 0px'
  });

  sections.forEach(sec => {
    activeLinkObserver.observe(sec);
  });

  // --- CONTACT FORM SUBMISSION HANDLING ---
  const contactForm = document.getElementById('portfolioContactForm');
  const formStatus = document.getElementById('formStatus');

  // To receive email notifications, replace this with your Web3Forms Access Key
  // You can get one for free at https://web3forms.com
  const WEB3FORMS_ACCESS_KEY = "809de946-a6d2-4fae-bea0-3aca7aaaadf2";

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const prevBtnText = submitBtn.innerHTML;

      // Visual feedback loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Message <i class="fas fa-circle-notch fa-spin"></i>';

      // Ensure form status is visible
      formStatus.style.display = 'block';
      formStatus.className = 'form-status';
      formStatus.innerHTML = 'Sending...';

      try {
        const name = document.getElementById('formName').value.trim();
        const email = document.getElementById('formEmail').value.trim();
        const subject = document.getElementById('formSubject').value.trim();
        const message = document.getElementById('formMessage').value.trim();

        if (!name || !email || !subject || !message) {
          throw new Error('Please fill in all fields correctly.');
        }

        // Email regex pattern validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address.');
        }

        if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE" || WEB3FORMS_ACCESS_KEY.trim() === "") {
          // Fallback for testing/demonstration when no key is set
          await new Promise(resolve => setTimeout(resolve, 1000));
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<strong>Demo Mode!</strong> Form validation passed. (To enable actual email notifications, please add your Web3Forms Access Key at the top of the contact handler in <code>script.js</code>).`;
          contactForm.reset();
          return;
        }

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            name: name,
            email: email,
            subject: subject,
            message: message,
            from_name: "Portfolio Contact Form Submission"
          })
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<strong>Success!</strong> Thank you, ${name}. Your message has been sent successfully.`;
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Failed to send message. Please try again later.');
        }
      } catch (err) {
        console.error(err);
        formStatus.className = 'form-status error';
        formStatus.innerHTML = `<strong>Error!</strong> ${err.message || 'A network error occurred. Please try again.'}`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = prevBtnText;

        // Auto fade out status message after 10s
        setTimeout(() => {
          formStatus.style.display = 'none';
        }, 10000);
      }
    });
  }
});
