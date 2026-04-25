function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 3 + 1.5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${Math.random() * 12 + 6}s`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    particlesContainer.appendChild(particle);
  }
}
createParticles();

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  const allLinks = navLinks.querySelectorAll('a');
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === "#") return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const downloadBtn = document.getElementById('downloadCVBtn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Ganti link href pada tombol dengan file PDF kamu.");
  });
}

const toggleCertBtn = document.getElementById('toggleCertBtn');
if (toggleCertBtn) {
  toggleCertBtn.addEventListener('click', function() {
    const moreCerts = document.getElementById('moreCertificates');
    if (moreCerts.style.display === 'none' || moreCerts.style.display === '') {
      moreCerts.style.display = 'block';
      toggleCertBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Tutup Sertifikat';
    } else {
      moreCerts.style.display = 'none';
      toggleCertBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Lihat Sertifikat Lainnya (1)';
    }
  });
}

const projectsData = [
  { title: "Game Stack", description: "Game ini bertipe arcade sederhana, di mana kamu harus menumpuk balok yang bergerak agar pas di atas balok sebelumnya.", tags: ["HTML", "CSS", "JS"], image: "potoprojek/stak.png", link: "game/3DStackGame" },
  { title: "Website Portfolio", description: "Website portofolio modern responsif", tags: ["HTML", "CSS", "JS"], image: "potoprojek/portofolio.png", link: "potoprojek/galau.jpg" },
  { title: "Game Rock Paper Scissors", description: "Game ini merupakan permainan sederhana yang dimainkan oleh dua pihak (kamu vs komputer). Setiap pemain memilih salah satu dari tiga pilihan Batu, Gunting, dan Kerta.", tags: ["HTML", "CSS", "JS"], image: "potoprojek/RockPaperScissorsGame.png", link: "game/RockPaperScissorsGame" },
  { title: "Coming Soon", description: "Coming Soon", tags: ["HTML", "CSS", "JS"], icon: "fa-comments", link: "Coming Soon" }
];

let currentFilteredProjects = [...projectsData];
let projectsExpanded = false;

function createProjectCard(project) {
  return `
    <div class="project-card slide-up" onclick="openProjectLink('${project.link}')">
      <div class="project-img">
        <img src="${project.image}" alt="${project.title}" class="project-img-real">
      </div>
      <div class="project-info">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        <div class="project-buttons" onclick="event.stopPropagation()">
          <button class="demo-btn" onclick="openProjectLink('${project.link}')"><i class="fas fa-external-link-alt"></i> Lihat</button>
        </div>
      </div>
    </div>
  `;
}

function renderProjects() {
  const projectsGrid = document.getElementById('projectsGrid');
  const moreProjectsDiv = document.getElementById('moreProjects');
  const moreProjectsGrid = document.getElementById('moreProjectsGrid');
  const noResults = document.getElementById('noResults');
  const toggleContainer = document.getElementById('projectToggleContainer');
  const remainingSpan = document.getElementById('remainingCount');
  if (!projectsGrid) return;
  
  const initialCount = 3;
  
  if (currentFilteredProjects.length === 0) {
    projectsGrid.innerHTML = '';
    if (moreProjectsDiv) moreProjectsDiv.style.display = 'none';
    if (toggleContainer) toggleContainer.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    return;
  }
  
  if (noResults) noResults.style.display = 'none';
  if (toggleContainer) toggleContainer.style.display = 'block';
  
  const initialProjects = currentFilteredProjects.slice(0, initialCount);
  const remainingProjects = currentFilteredProjects.slice(initialCount);
  
  projectsGrid.innerHTML = initialProjects.map(p => createProjectCard(p)).join('');
  
  if (moreProjectsGrid) {
    moreProjectsGrid.innerHTML = remainingProjects.map(p => createProjectCard(p)).join('');
  }
  
  if (remainingSpan) remainingSpan.innerText = remainingProjects.length;
  
  const toggleBtn = document.getElementById('toggleProjectBtn');
  if (toggleBtn) {
    if (projectsExpanded) {
      toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Tutup Proyek';
    } else {
      toggleBtn.innerHTML = `<i class="fas fa-chevron-down"></i> Lihat Proyek Lainnya (${remainingProjects.length})`;
    }
  }
  
  if (moreProjectsDiv) {
    moreProjectsDiv.style.display = projectsExpanded && remainingProjects.length > 0 ? 'block' : 'none';
  }
  
  if (toggleBtn && remainingProjects.length === 0 && toggleContainer) {
    toggleContainer.style.display = 'none';
  }
}

const toggleProjectBtn = document.getElementById('toggleProjectBtn');
if (toggleProjectBtn) {
  toggleProjectBtn.addEventListener('click', function() {
    projectsExpanded = !projectsExpanded;
    renderProjects();
  });
}

function filterProjects(searchTerm) {
  const term = searchTerm.toLowerCase();
  currentFilteredProjects = projectsData.filter(project => {
    return project.title.toLowerCase().includes(term) ||
           project.description.toLowerCase().includes(term) ||
           project.tags.some(tag => tag.toLowerCase().includes(term));
  });
  projectsExpanded = false;
  renderProjects();
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    filterProjects(e.target.value);
  });
}

renderProjects();

function openCertModal(imageUrl) {
  const modal = document.getElementById('certModal');
  const modalImage = document.getElementById('modalImage');
  if (modal && modalImage) {
    modalImage.src = imageUrl;
    modal.style.display = 'block';
  }
}

function closeCertModal() {
  const modal = document.getElementById('certModal');
  if (modal) modal.style.display = 'none';
}

function openProjectLink(url) {
  if (url && url !== '#') {
    window.open(url, '_blank');
  } else {
    alert("🔗 Ganti link proyek dengan URL asli kamu!");
  }
}

window.onclick = function(event) {
  const certModal = document.getElementById('certModal');
  if (event.target === certModal && certModal) closeCertModal();
}

window.addEventListener('resize', () => {
  if (window.innerWidth >= 768 && navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
  }
});

