// =======================
//  -TEMA CLARO/OSCURO
// =======================
const body = document.body;
const toggleBtn = document.getElementById('toogleTheme');

const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') body.classList.add('dark');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        body.classList.toogle('dark');
        const newTheme = body.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        toggleBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    });
}