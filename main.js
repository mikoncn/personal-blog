document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    const navLinks = document.querySelectorAll('.nav-link');
    const postCards = document.querySelectorAll('.post-card');
    const techTags = document.querySelectorAll('.tech-tag');

    ctaButton.addEventListener('click', function() {
        const postsSection = document.querySelector('.posts-section');
        postsSection.scrollIntoView({ behavior: 'smooth' });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
            }, 100);
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });

    postCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = '#00D9FF';
        });

        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '#FCEE0A';
        });
    });

    techTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const originalText = this.textContent;
            this.textContent = '已选择';
            this.style.background = '#00ff00';
            this.style.color = '#0a0a0a';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = 'rgba(0, 255, 0, 0.1)';
                this.style.color = '#00ff00';
            }, 1000);
        });
    });

    const readMoreLinks = document.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postCard = this.closest('.post-card');
            postCard.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                postCard.style.animation = '';
            }, 500);
        });
    });

    const title = document.querySelector('.title');
    let hue = 0;
    setInterval(() => {
        hue = (hue + 1) % 360;
        const color = `hsl(${hue}, 100%, 50%)`;
        title.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`;
    }, 50);

    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', function(e) {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        hero.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    hero.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });

    const sectionTitles = document.querySelectorAll('.section-title');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, observerOptions);

    sectionTitles.forEach(title => {
        title.style.opacity = '0';
        title.style.transform = 'translateX(-50px)';
        title.style.transition = 'all 0.6s ease';
        observer.observe(title);
    });
});
