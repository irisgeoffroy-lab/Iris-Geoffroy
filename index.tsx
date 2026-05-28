
import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";

// --- Utils ---

/**
 * Nettoie et formate les URLs d'images pour s'assurer qu'elles s'affichent.
 * Gère notamment les liens Imgur pour forcer l'extension .png
 */
const formatImageUrl = (url: string): string => {
  if (!url) return "";
  let formatted = url.trim();
  
  if (formatted.startsWith("data:image")) return formatted;
  
  if (formatted.includes("imgur.com") && !formatted.includes("i.imgur.com")) {
    const idMatch = formatted.match(/imgur\.com\/(?:gallery\/|a\/|r\/[^\/]+\/)?([a-zA-Z0-9]+)/);
    if (idMatch && idMatch[1]) {
      return `https://i.imgur.com/${idMatch[1]}.png`;
    }
  }
  
  if (formatted.includes("imgur.com") && formatted.split('/').pop()?.length === 7) {
     return `https://i.imgur.com/${formatted.split('/').pop()}.png`;
  }

  return formatted;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Types ---

interface Project {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  legend: string;
  images: string[];
  imageDescriptions?: string[];
}

interface SiteData {
  heroSubtitle: string;
  aboutText: string;
  aboutQuote: string;
  aboutImage: string;
  footerText: string;
}

// ============================================================
// 👇 DONNÉES SOURCES DU SITE 👇
// ============================================================

const DEFAULT_PROJECTS: Project[] = [
  {
    "id": "1",
    "title": "Vitrine Librairie Mollat",
    "date": "2025",
    "category": "Scénographie",
    "description": "Installation vitrine mettant en scène un carrousel onirique pour la célèbre librairie bordelaise. Ce projet explore la suspension du temps à travers des mécanismes légers et des jeux de lumière tamisée.",
    "legend": "L'imaginaire en suspension.",
    "images": [
      "https://i.imgur.com/ApVOm2Y.jpg"
    ],
    "imageDescriptions": [
      "Vue d'ensemble de la vitrine principale."
    ]
  },
  {
    "id": "2",
    "title": "Festival OISHI!",
    "date": "2026",
    "category": "Identité Visuelle",
    "description": "Identité visuelle complète pour le Japan Food Festival : logo, affiches et supports digitaux. L'enjeu était de marier tradition japonaise et modernité urbaine.",
    "legend": "Un festin visuel.",
    "images": [
      "https://imgur.com/boplTL2",
      "https://imgur.com/uupPEyz",
      "https://imgur.com/bZzxFBU",
      "https://imgur.com/9Z4INxq",
      "https://imgur.com/cj1TFzE",
      "https://imgur.com/EYjRYNF",
      "https://imgur.com/sDaW9C1"
    ],
    "imageDescriptions": [
      "Design du logo et des affiches promotionnelles.",
      "Application sur packaging événementiel.",
      "", "", "", "", ""
    ]
  },
  {
    "title": "Rosebud",
    "date": "2024",
    "category": "Vynile",
    "description": "Travail en collaboration avec Florimel Girard et Jade Couzard",
    "legend": "",
    "images": [
      "https://imgur.com/LvKvuZ9",
      "https://imgur.com/qpBjhcT",
      "https://imgur.com/rB8qQHD"
    ],
    "imageDescriptions": ["Pochette recto", "Pochette verso", "Détail vinyle"],
    "id": "1766522277770"
  },
  {
    "title": "FloraNova",
    "date": "2024",
    "category": "Print",
    "description": "Une de journal sur la faune et la flore.",
    "legend": "",
    "images": [
      "https://imgur.com/uyKep4d",
      "https://imgur.com/vEF4uER"
    ],
    "imageDescriptions": ["Couverture", "Mise en page intérieure"],
    "id": "1766522455083"
  },
  {
    "title": "Mira",
    "date": "2025",
    "category": "Identité Visuelle",
    "description": "Identité et packaging pour l'édition limité de la bière Mira",
    "legend": "",
    "images": [
      "https://imgur.com/Njy6XDR",
      "https://imgur.com/seR5AkJ",
      "https://imgur.com/OwQYTi6",
      "https://imgur.com/WNPvcJz"
    ],
    "imageDescriptions": ["Bouteille principale", "Packaging carton", "Logo décliné", "Détail étiquette"],
    "id": "1766522615100"
  }
];

const DEFAULT_SITE_DATA: SiteData = {
  "heroSubtitle": "Designer graphique & Illustratrice. Je crée des narrations visuelles.",
  "aboutText": "Je suis Iris Geoffroy, étudiante de 25 ans à l'ECV Bordeaux en Master 1 de Design Graphique. Mon parcours est guidé par une fascination pour le minimalisme et la capacité du design à transformer notre perception du quotidien.",
  "aboutQuote": "L'art doit être un pont entre l'imaginaire et la préservation du vivant.",
  "aboutImage": "https://imgur.com/YqzK5vi",
  "footerText": "© 2025 Iris Geoffroy — Tous droits réservés."
};

// --- Components ---

const RevealOnScroll = ({ children, delay = 0 }: { children?: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal-hidden ${isVisible ? 'reveal-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const VerticalTicker = ({ words }: { words: string[] }) => {
  const items = useMemo(() => [...words, ...words], [words]);
  return (
    <div className="vertical-ticker-container">
      <div className="vertical-ticker-track">
        {items.map((word, i) => (
          <div key={i} className="ticker-item">{word}</div>
        ))}
      </div>
    </div>
  );
};

const HorizontalMarquee = ({ items }: { items: string[] }) => {
  return (
    <div className="horizontal-marquee-container">
      <div className="horizontal-marquee-track">
        {[...items, ...items, ...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-text">{item}</span>
            <span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const isMouse = window.matchMedia('(pointer: fine)').matches;
    if (!isMouse) {
      cursor.style.display = 'none';
      return;
    }

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const move = (e: MouseEvent) => { 
      mouse.x = e.clientX; 
      mouse.y = e.clientY; 
    };
    
    window.addEventListener('mousemove', move);

    let frameId: number;
    const anim = () => {
      pos.x += (mouse.x - pos.x) * 0.15; 
      pos.y += (mouse.y - pos.y) * 0.15;
      
      const el = document.elementFromPoint(mouse.x, mouse.y);
      const interact = el?.matches('button, a, input, textarea, img, .nav-btn, .modal-close-btn, select, .admin-btn, .thumb-btn') || 
                       !!el?.closest('button, a, img, .nav-btn, .modal-close-btn, .admin-btn, .thumb-btn');

      if (cursor) {
        cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${interact ? 2 : 1})`;
        cursor.style.opacity = '1';
      }
      frameId = requestAnimationFrame(anim);
    };
    
    frameId = requestAnimationFrame(anim);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(frameId);
    };
  }, []);
  return <div ref={cursorRef} className="custom-cursor" />;
};

const Navbar = ({ isAdmin, onAdminClick }: { isAdmin: boolean; onAdminClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div 
        className="nav-brand" 
        onDoubleClick={onAdminClick}
        style={{ cursor: "pointer" }}
        title="Double-cliquer pour l'administration"
      >
        Iris Geoffroy
      </div>
      <div className="nav-right">
        <ul className="nav-links">
          {["Accueil", "À Propos", "Projets", "Contact"].map(item => (
            <li key={item}>
              <button 
                onClick={() => document.getElementById(item.toLowerCase().replace(" ", "-"))?.scrollIntoView({behavior:"smooth"})} 
                className="nav-link-btn"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
        {isAdmin && (
          <button className="nav-admin-btn active" onClick={onAdminClick}>
            ADMIN ON
          </button>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteData, setSiteData] = useState<SiteData>(DEFAULT_SITE_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSiteEditor, setShowSiteEditor] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const categories = ["Tous", "Scénographie", "Vynile", "Print", "Identité Visuelle"];

  useEffect(() => {
    const p = localStorage.getItem("iris_portfolio_projects");
    const s = localStorage.getItem("iris_portfolio_data");
    if (p) {
      setProjects(JSON.parse(p));
    } else {
      setProjects(DEFAULT_PROJECTS);
    }
    
    if (s) {
      const parsed = JSON.parse(s);
      // Correction automatique si l'ancienne phrase est encore présente en localStorage
      if (parsed.heroSubtitle && parsed.heroSubtitle.includes("qui allient esthétique japonaise")) {
        parsed.heroSubtitle = DEFAULT_SITE_DATA.heroSubtitle;
      }
      setSiteData(parsed);
    } else {
      setSiteData(DEFAULT_SITE_DATA);
    }
    
    if (localStorage.getItem("iris_admin") === "true") setIsAdmin(true);
  }, []);

  useEffect(() => {
    if (projects.length === 0 && siteData.heroSubtitle === DEFAULT_SITE_DATA.heroSubtitle) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("iris_portfolio_projects", JSON.stringify(projects));
        localStorage.setItem("iris_portfolio_data", JSON.stringify(siteData));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('idle');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [projects, siteData]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "Tous") return projects;
    return projects.filter(p => p.category === activeFilter);
  }, [projects, activeFilter]);

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nom = formData.get("nom") as string;
    const email = formData.get("email") as string;
    const projet = formData.get("projet") as string;
    
    const subject = encodeURIComponent(`Contact Portfolio - ${nom}`);
    const body = encodeURIComponent(
      `Bonjour Iris,\n\nVous avez reçu un nouveau message depuis votre portfolio :\n\n` +
      `Nom : ${nom}\n` +
      `Email : ${email}\n\n` +
      `Projet / Message :\n${projet}`
    );
    
    window.location.href = `mailto:irisgeoffroy@hotmail.com?subject=${subject}&body=${body}`;
  };

  const openProject = (p: Project) => { 
    setSelectedProject(p); 
    setCurrentImgIdx(0); 
    document.body.style.overflow = 'hidden';
  };
  
  const closeProject = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  const nextImg = (e: React.MouseEvent) => { 
    e.stopPropagation();
    if (!selectedProject) return; 
    setCurrentImgIdx((prev) => (prev + 1) % selectedProject.images.length); 
  };

  const prevImg = (e: React.MouseEvent) => { 
    e.stopPropagation();
    if (!selectedProject) return; 
    setCurrentImgIdx((prev) => (prev - 1 + selectedProject.images.length) % selectedProject.images.length); 
  };

  const selectImg = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx(idx);
  };
  
  const updateProjectField = (field: keyof Project, value: any) => { 
    if (!editingProject) return; 
    setEditingProject({ ...editingProject, [field]: value }); 
  };

  const handleFileChange = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !editingProject) return;
    try {
      const base64 = await fileToBase64(e.target.files[0]);
      const newImages = [...(editingProject.images || [])];
      newImages[idx] = base64;
      updateProjectField('images', newImages);
    } catch (err) { alert("Erreur fichier"); }
  };

  const addImageRow = () => {
    if (!editingProject) return;
    const newImages = [...(editingProject.images || []), ""];
    const newDescs = [...(editingProject.imageDescriptions || []), ""];
    setEditingProject({ ...editingProject, images: newImages, imageDescriptions: newDescs });
  };

  const saveEditingProject = () => {
    if (!editingProject) return;
    const pToSave = { 
      ...editingProject, 
      id: editingProject.id || Date.now().toString(),
      date: editingProject.date || new Date().getFullYear().toString(),
      images: (editingProject.images || []).filter(url => url.trim() !== ""),
    } as Project;
    if (projects.find(p => p.id === pToSave.id)) { 
      setProjects(prev => prev.map(p => p.id === pToSave.id ? pToSave : p)); 
    } else { 
      setProjects(prev => [...prev, pToSave]); 
    }
    setEditingProject(null);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.setItem("iris_admin", "false");
    } else {
      setShowLogin(true);
    }
  };

  const resetToSourceCode = () => {
    if (confirm("Attention : Cela va effacer votre cache local et recharger les données par défaut. Continuer ?")) {
      localStorage.removeItem("iris_portfolio_projects");
      localStorage.removeItem("iris_portfolio_data");
      window.location.reload();
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="app-main">
      {saveStatus !== 'idle' && (
        <div className={`sync-status ${saveStatus}`}>
          <div className="sync-dot" />
          <span>{saveStatus === 'saving' ? 'Synchro...' : 'Enregistré'}</span>
        </div>
      )}

      <Navbar isAdmin={isAdmin} onAdminClick={handleAdminToggle} />
      
      <section id="accueil" className="hero-section">
        <div className="hero-content">
          <RevealOnScroll>
            <div className="hero-titles-wrap">
              <h1 className="hero-main-title">
                <span className="hero-pre-title">Graphisme & Illustration</span>
                <VerticalTicker words={["Harmonie", "Poésie"]} />
                <span className="hero-italic-title">Narrative</span>
              </h1>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <p className="hero-subtitle">{siteData.heroSubtitle}</p>
          </RevealOnScroll>
        </div>
        <div className="hero-marquee-wrapper">
           <HorizontalMarquee items={["Print", "Illustration", "Identité Visuelle", "Packaging", "Scénographie", "Vynile"]} />
        </div>
      </section>

      <section id="à-propos" className="about-section">
        <div className="about-container">
          <RevealOnScroll>
            <div className="about-image-wrapper">
              <img src={formatImageUrl(siteData.aboutImage)} className="about-img" alt="Iris Geoffroy" />
            </div>
          </RevealOnScroll>
          <div className="about-content">
            <h2 className="section-title">L'essence du <br/><span className="title-serif">Minimalisme</span>.</h2>
            <p className="about-body-text">{siteData.aboutText}</p>
            <div className="quote-box">
              <p className="quote-text">"{siteData.aboutQuote}"</p>
            </div>
            {isAdmin && <button onClick={() => setShowSiteEditor(true)} className="edit-site-btn">ÉDITER LES INFOS</button>}
          </div>
        </div>
      </section>

      <section id="projets" className="projects-section">
        <div className="projects-container">
           <RevealOnScroll>
             <h2 className="section-title-huge">Sélection de <br/><span className="title-serif">travaux</span></h2>
           </RevealOnScroll>
           <div className="filter-bar">
             {categories.map(cat => (
               <button key={cat} onClick={() => setActiveFilter(cat)} className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}>{cat}</button>
             ))}
             {isAdmin && <button onClick={() => setEditingProject({ title: "", date: new Date().getFullYear().toString(), category: "Tous", description: "", legend: "", images: [""], imageDescriptions: [""] })} className="add-project-btn-inline">+ PROJET</button>}
           </div>
           <div className="projects-grid">
             {filteredProjects.map((p, i) => (
               <RevealOnScroll key={p.id} delay={i * 50}>
                 <div className="project-card" onClick={() => openProject(p)}>
                   <div className="project-img-container"><img src={formatImageUrl(p.images[0])} className="project-img" alt={p.title} /></div>
                   <div className="project-info">
                     <span className="project-cat">{p.category}</span>
                     <h3 className="project-title">{p.title}</h3>
                   </div>
                   {isAdmin && <div className="admin-actions">
                     <button onClick={(e) => { e.stopPropagation(); setEditingProject(p); }} className="admin-btn">✎</button>
                     <button onClick={(e) => { e.stopPropagation(); if(confirm("Supprimer ?")) setProjects(projects.filter(x => x.id !== p.id)); }} className="admin-btn">✕</button>
                   </div>}
                 </div>
               </RevealOnScroll>
             ))}
           </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-container">
          <RevealOnScroll><h2 className="contact-title">Parlons de <span className="title-serif white">vous</span></h2></RevealOnScroll>
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-row">
              <input name="nom" className="half" type="text" placeholder="NOM" required />
              <input name="email" className="half" type="email" placeholder="EMAIL" required />
            </div>
            <textarea name="projet" placeholder="PROJET" rows={2} required></textarea>
            <button type="submit" className="contact-submit-btn">ENVOYER</button>
          </form>
        </div>
      </section>

      <footer className="footer-main">
        <div className="footer-container">
          <div className="footer-top-row">
            <div 
              className="footer-branding" 
              onDoubleClick={handleAdminToggle} 
              style={{ cursor: "pointer" }}
              title="Double-cliquer pour l'administration"
            >
              <h2 className="footer-name">Iris Geoffroy</h2>
              <p className="footer-tagline">Design Graphique & Narrative Visuelle</p>
            </div>
            <button className="back-to-top" onClick={scrollToTop}>
              <span className="arrow">↑</span> RETOUR EN HAUT
            </button>
          </div>

          <div className="footer-grid">
            <div className="footer-col">
              <span className="footer-label">Navigation</span>
              <ul className="footer-links">
                <li><button onClick={() => document.getElementById('accueil')?.scrollIntoView({behavior:'smooth'})}>Accueil</button></li>
                <li><button onClick={() => document.getElementById('à-propos')?.scrollIntoView({behavior:'smooth'})}>À Propos</button></li>
                <li><button onClick={() => document.getElementById('projets')?.scrollIntoView({behavior:'smooth'})}>Projets</button></li>
                <li><button onClick={() => document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}>Contact</button></li>
              </ul>
            </div>
            <div className="footer-col">
              <span className="footer-label">Réseaux</span>
              <ul className="footer-links">
                <li><a href="https://www.instagram.com/t4k0tsu80/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href="https://www.linkedin.com/in/geoffroy-iris-a711b9219/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <span className="footer-label">Contact Direct</span>
              <a href="mailto:irisgeoffroy@hotmail.com" className="footer-email-link">irisgeoffroy@hotmail.com</a>
              <p className="footer-location">Basée à Bordeaux, France</p>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="copyright">{siteData.footerText}</span>
            <span className="built-with">Design & Code par Iris G.</span>
          </div>
        </div>
      </footer>

      {/* MODALES ET UI ADMIN */}
      {selectedProject && (
        <div className="modal-overlay immersive-overlay" onClick={closeProject}>
          <div className="modal-content-card immersive-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn large" onClick={closeProject}>✕</button>
            <div className="immersive-grid">
              <div className="immersive-image-pane">
                 <div className="image-counter">
                   <span className="current">{String(currentImgIdx + 1).padStart(2, '0')}</span>
                   <span className="separator">/</span>
                   <span className="total">{String(selectedProject.images.length).padStart(2, '0')}</span>
                 </div>
                 <div className="img-frame">
                    {selectedProject.images.length > 1 && (
                      <>
                        <button className="nav-arrow prev" onClick={prevImg}>‹</button>
                        <button className="nav-arrow next" onClick={nextImg}>›</button>
                      </>
                    )}
                    <img key={currentImgIdx} src={formatImageUrl(selectedProject.images[currentImgIdx])} className="immersive-img fade-in" alt={selectedProject.title} />
                 </div>
                 {selectedProject.images.length > 1 && (
                    <div className="immersive-thumbnails-gallery">
                       {selectedProject.images.map((img, idx) => (
                         <button key={idx} onClick={(e) => selectImg(idx, e)} className={`gallery-thumb-btn ${currentImgIdx === idx ? 'active' : ''}`}><img src={formatImageUrl(img)} alt={`Page ${idx + 1}`} /></button>
                       ))}
                    </div>
                 )}
              </div>
              <div className="immersive-text-pane">
                <div className="text-scroll-container">
                  <div className="meta-tag">{selectedProject.category} — {selectedProject.date}</div>
                  <h2 className="detail-title">{selectedProject.title}</h2>
                  <div className="project-description-block"><p className="detail-description">{selectedProject.description}</p></div>
                  <div className="detail-legend-box">
                    <div className="legend-label">DÉTAILS DU VISUEL :</div>
                    <p className="legend-content">{selectedProject.imageDescriptions?.[currentImgIdx] || selectedProject.legend || "Pas de description additionnelle."}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogin && <div className="modal-overlay" onClick={() => setShowLogin(false)}>
        <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
          <h3>Accès Backoffice</h3>
          <p style={{fontSize: '0.7rem', opacity: 0.5, marginBottom: '1rem'}}>Entrez le mot de passe pour gérer vos projets.</p>
          <input type="password" placeholder="Mot de passe" autoFocus onKeyDown={e => { if(e.key === 'Enter' && e.currentTarget.value === 'admin') { setIsAdmin(true); localStorage.setItem("iris_admin", "true"); setShowLogin(false); } }} />
          <button className="save-btn" style={{marginTop: '1rem'}} onClick={(e) => { const input = (e.currentTarget.previousSibling as HTMLInputElement); if(input.value === 'admin') { setIsAdmin(true); localStorage.setItem("iris_admin", "true"); setShowLogin(false); } }}>SE CONNECTER</button>
          <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee'}}><button onClick={resetToSourceCode} className="reset-source-btn">RÉINITIALISER LES DONNÉES</button></div>
        </div>
      </div>}

      {showSiteEditor && <div className="modal-overlay" onClick={() => setShowSiteEditor(false)}>
        <div className="admin-modal-card wide scrollable" onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header"><h2>Édition du site</h2><button onClick={() => setShowSiteEditor(false)} className="close-x">✕</button></div>
          <div className="admin-field"><label>Sous-titre Hero</label><textarea value={siteData.heroSubtitle} onChange={e => setSiteData({...siteData, heroSubtitle: e.target.value})} rows={2} /></div>
          <div className="admin-field"><label>Biographie</label><textarea value={siteData.aboutText} onChange={e => setSiteData({...siteData, aboutText: e.target.value})} rows={5} /></div>
          <div className="admin-field"><label>Citation</label><input value={siteData.aboutQuote} onChange={e => setSiteData({...siteData, aboutQuote: e.target.value})} /></div>
          <div className="admin-field">
            <label>Photo Bio (URL)</label>
            <div className="admin-image-row-complex">
              <input value={siteData.aboutImage} onChange={e => setSiteData({...siteData, aboutImage: e.target.value})} />
              <label className="upload-label-btn">↑<input type="file" onChange={async e => { if(e.target.files?.[0]) { const b64 = await fileToBase64(e.target.files[0]); setSiteData({...siteData, aboutImage: b64}); } }} hidden /></label>
            </div>
          </div>
          <button onClick={() => setShowSiteEditor(false)} className="save-btn">ENREGISTRER</button>
        </div>
      </div>}

      {editingProject && <div className="modal-overlay" onClick={() => setEditingProject(null)}>
        <div className="admin-modal-card wide scrollable" onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header"><h2>{editingProject.id ? "Modifier Projet" : "Nouveau Projet"}</h2><button onClick={() => setEditingProject(null)} className="close-x">✕</button></div>
          <div className="admin-field"><label>Titre</label><input value={editingProject.title || ""} onChange={e => updateProjectField('title', e.target.value)} /></div>
          <div className="admin-field"><label>Année</label><input value={editingProject.date || ""} onChange={e => updateProjectField('date', e.target.value)} /></div>
          <div className="admin-field"><label>Catégorie</label><select value={editingProject.category || "Tous"} onChange={e => updateProjectField('category', e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="admin-field"><label>Description</label><textarea value={editingProject.description || ""} onChange={e => updateProjectField('description', e.target.value)} rows={3} /></div>
          <div className="admin-field">
            <label className="flex-between">Images <button onClick={addImageRow} className="add-url-btn-mini">+ IMAGE</button></label>
            {(editingProject.images || []).map((url, idx) => (
              <div key={idx} className="admin-image-row-complex" style={{marginBottom:'0.5rem'}}>
                <input value={url} onChange={e => { const ni = [...(editingProject.images || [])]; ni[idx] = e.target.value; updateProjectField('images', ni); }} placeholder="URL..." />
                <label className="upload-label-btn">↑<input type="file" onChange={e => handleFileChange(idx, e)} hidden /></label>
                <button onClick={() => { const ni = editingProject.images?.filter((_, i) => i !== idx); setEditingProject({...editingProject, images: ni}); }} style={{background:'none', border:'none', cursor:'pointer'}}>✕</button>
              </div>
            ))}
          </div>
          <button className="save-btn" onClick={saveEditingProject}>PUBLIER</button>
        </div>
      </div>}

      <CustomCursor />

      <style>{`
        :root {
          --bg-site: #f8f7f4;
          --white-pure: #ffffff;
          --accent-red: #cc0000;
          --text-main: #111111;
          --header-bg: rgba(248, 247, 244, 0.9);
          --footer-bg: #fdfdfb;
        }
        .app-main { background: var(--bg-site); color: var(--text-main); font-family: 'Jost', sans-serif; overflow-x: hidden; }
        
        .custom-cursor { position: fixed; top: 0; left: 0; width: 14px; height: 14px; background: var(--accent-red); border-radius: 50%; pointer-events: none; z-index: 2147483647; transition: transform 0.1s ease-out, opacity 0.3s; display: block; opacity: 0; }

        .navbar { position: fixed; top: 0; width: 100%; padding: 1.2rem 5%; z-index: 10000; display: flex; justify-content: space-between; align-items: center; transition: 0.5s; background: var(--header-bg); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.02); }
        .nav-brand { font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; }
        .nav-right { display: flex; align-items: center; gap: 3rem; }
        .nav-links { list-style: none; display: flex; gap: 2rem; }
        .nav-link-btn { background: none; border: none; font-size: 0.7rem; text-transform: uppercase; font-weight: 700; cursor: pointer; opacity: 0.6; transition: 0.3s; color: #000; }
        .nav-link-btn:hover { opacity: 1; color: var(--accent-red); }
        .nav-admin-btn { background: #000; color: #fff; border: none; font-size: 0.6rem; font-weight: 900; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; transition: 0.3s; letter-spacing: 1px; }

        /* HERO & TICKER */
        .hero-section { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 140px 0 0; }
        .hero-main-title { font-size: clamp(2.5rem, 9.5vw, 8.5rem); font-weight: 900; text-transform: uppercase; letter-spacing: -4px; display: flex; flex-direction: column; align-items: center; line-height: 0.9; text-align: center; }
        .hero-pre-title { font-size: 0.11em; color: var(--accent-red); letter-spacing: 12px; margin-bottom: 0.5rem; opacity: 0.8; }
        .hero-italic-title { font-family: 'Playfair Display', serif; font-style: italic; text-transform: none; margin-top: -0.1em; letter-spacing: -1px; }
        .hero-subtitle { max-width: 500px; margin: 1.5rem auto 0; font-size: 0.9rem; line-height: 1.6; opacity: 0.5; text-transform: uppercase; text-align: center; }

        .vertical-ticker-container { height: 1.1em; overflow: hidden; position: relative; display: inline-block; vertical-align: middle; text-align: center; width: 100%; }
        .vertical-ticker-track { display: flex; flex-direction: column; animation: ticker-scroll-up 5s cubic-bezier(0.76, 0, 0.24, 1) infinite; }
        .ticker-item { height: 1.1em; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--accent-red); text-transform: uppercase; }

        @keyframes ticker-scroll-up { 
          0%, 15% { transform: translateY(0); } 
          25%, 40% { transform: translateY(-25%); } 
          50%, 65% { transform: translateY(-50%); } 
          75%, 90% { transform: translateY(-75%); } 
          100% { transform: translateY(-100%); } 
        }

        .hero-marquee-wrapper { width: 100%; margin-top: auto; overflow: hidden; }
        .horizontal-marquee-container { width: 100%; padding: 1.5rem 0; overflow: hidden; white-space: nowrap; position: relative; border-top: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05); }
        .horizontal-marquee-track { display: inline-flex; animation: marquee-rtl 40s linear infinite; }
        .marquee-item { display: inline-flex; align-items: center; padding: 0 4rem; }
        .marquee-text { font-weight: 800; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 5px; opacity: 0.6; }

        /* ABOUT */
        .about-section { padding: 8rem 10%; background: #fff; }
        .about-container { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.2fr; gap: 4rem; align-items: center; }
        .about-img { width: 100%; filter: grayscale(1); box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
        .section-title { font-size: 2.2rem; font-weight: 900; text-transform: uppercase; margin-bottom: 1.5rem; letter-spacing: -1px; }
        .title-serif { font-family: 'Playfair Display', serif; font-style: italic; text-transform: none; }
        .about-body-text { font-size: 1.05rem; line-height: 1.8; opacity: 0.7; }
        .quote-box { border-left: 2px solid var(--accent-red); padding-left: 1.5rem; font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.2rem; margin: 2rem 0; }

        /* PROJECTS COMPACT - FIXED GRID (ANTI-ZOOM) */
        .projects-section { padding: 8rem 5%; }
        .projects-container { max-width: 1440px; margin: 0 auto; }
        .section-title-huge { font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 900; text-transform: uppercase; margin-bottom: 2.5rem; letter-spacing: -2px; line-height: 0.95; }
        
        /* Filter Bar & Buttons hover */
        .filter-bar { display: flex; gap: 0.7rem; margin-bottom: 4rem; flex-wrap: wrap; }
        .filter-btn { 
          background: #fff; 
          border: 1px solid #e5e5e5; 
          padding: 0.6rem 1.4rem; 
          border-radius: 50px; 
          font-weight: 800; 
          text-transform: uppercase; 
          font-size: 0.6rem; 
          cursor: pointer; 
          transition: 0.3s cubic-bezier(0.2, 0, 0, 1); 
          letter-spacing: 1px; 
          color: #111; 
        }
        .filter-btn:hover { 
          border-color: var(--accent-red); 
          color: var(--accent-red); 
          transform: translateY(-3px); 
          box-shadow: 0 5px 15px rgba(204, 0, 0, 0.1); 
        }
        .filter-btn.active { background: var(--accent-red); color: #fff; border-color: var(--accent-red); }
        .filter-btn.active:hover { background: #b30000; color: #fff; }

        /* Correction: auto-fill au lieu d'auto-fit pour empêcher l'étirement d'un item seul */
        .projects-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 1.5rem; 
        }
        
        .project-card { background: #fff; padding: 1rem; cursor: pointer; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(0,0,0,0.02); position: relative; }
        .project-img-container { height: 320px; overflow: hidden; margin-bottom: 1.2rem; background: #f9f9f9; }
        .project-img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1); transition: 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .project-card:hover { border-color: rgba(0,0,0,0.08); box-shadow: 0 15px 35px rgba(0,0,0,0.04); z-index: 2; }
        .project-card:hover .project-img { filter: grayscale(0); transform: scale(1.05); }
        
        .project-info { padding: 0 0.2rem; }
        .project-cat { font-size: 0.55rem; font-weight: 900; text-transform: uppercase; color: var(--accent-red); opacity: 0.8; letter-spacing: 1px; }
        .project-title { font-size: 1.1rem; font-weight: 800; text-transform: uppercase; margin-top: 0.3rem; letter-spacing: -0.5px; line-height: 1.1; }

        /* CONTACT & FOOTER */
        .contact-section { background: #000; color: #fff; padding: 10rem 5% 6rem; text-align: center; position: relative; }
        .contact-title { font-size: clamp(2.5rem, 6vw, 4.5rem); text-transform: uppercase; font-weight: 900; margin-bottom: 4rem; line-height: 0.95; letter-spacing: -2px; }
        .contact-form { max-width: 700px; margin: 0 auto; }
        .contact-form input, .contact-form textarea { background: none; border-bottom: 1px solid #333; border-top:none; border-left:none; border-right:none; width: 100%; padding: 1.5rem 1rem; color: #fff; margin-bottom: 1rem; outline: none; transition: 0.4s; font-size: 1.1rem; font-family: inherit; }
        .contact-form input:focus, .contact-form textarea:focus { border-bottom-color: var(--accent-red); }
        .contact-submit-btn { background: var(--accent-red); color: #fff; border: none; padding: 1.2rem 4rem; font-weight: 900; cursor: pointer; font-size: 0.8rem; margin-top: 3rem; text-transform: uppercase; letter-spacing: 3px; border-radius: 2px; }

        .footer-main { background: var(--footer-bg); padding: 8rem 5% 4rem; border-top: 1px solid rgba(0,0,0,0.05); }
        .footer-container { max-width: 1400px; margin: 0 auto; }
        .footer-top-row { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 4rem; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 4rem; }
        .footer-name { font-size: 2.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; }
        .footer-tagline { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.2rem; opacity: 0.5; margin-top: 0.5rem; }
        
        .back-to-top { background: none; border: 1px solid #ddd; padding: 0.8rem 1.5rem; font-size: 0.65rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; border-radius: 50px; }
        .back-to-top:hover { background: #000; color: #fff; border-color: #000; }

        .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 4rem; margin-bottom: 6rem; }
        .footer-label { display: block; font-size: 0.6rem; text-transform: uppercase; font-weight: 900; letter-spacing: 2px; opacity: 0.3; margin-bottom: 1.5rem; }
        .footer-links { list-style: none; }
        .footer-links li { margin-bottom: 0.8rem; }
        .footer-links button, .footer-links a { background: none; border: none; font-size: 1rem; color: #111; cursor: pointer; text-decoration: none; position: relative; transition: 0.3s; font-weight: 500; }
        .footer-links button:hover, .footer-links a:hover { color: var(--accent-red); }

        .footer-email-link { font-size: 1.5rem; font-weight: 700; color: #111; text-decoration: none; display: block; margin-bottom: 0.5rem; transition: 0.3s; }
        .footer-email-link:hover { color: var(--accent-red); }
        .footer-location { font-size: 0.9rem; opacity: 0.5; }

        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.03); font-size: 0.75rem; opacity: 0.4; }

        /* MODALE & IMMERSIVE GRID */
        .immersive-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 30000; display: flex; align-items: center; justify-content: center; padding: 2.5rem; backdrop-filter: blur(8px); }
        .modal-content-card.immersive-modal { background: #fdfdfb; width: 95vw; height: 95vh; max-width: 1500px; display: flex; border-radius: 2px; overflow: hidden; position: relative; border: 1px solid rgba(0,0,0,0.1); }
        .immersive-grid { display: flex; width: 100%; height: 100%; }
        .immersive-image-pane { flex: 1.4; background: #f8f7f4; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 4rem 4rem 8rem; overflow: hidden; }
        .img-frame { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
        .immersive-img { max-width: 90%; max-height: 80vh; object-fit: contain; box-shadow: 0 30px 60px rgba(0,0,0,0.12); background: #fff; border: 1px solid rgba(0,0,0,0.05); transition: 0.4s ease; }
        .nav-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: none; border: none; color: #000; font-size: 4rem; font-weight: 200; cursor: pointer; z-index: 10; padding: 2rem; opacity: 0.3; transition: 0.3s; }
        .nav-arrow:hover { opacity: 1; color: var(--accent-red); }
        .nav-arrow.prev { left: 0; }
        .nav-arrow.next { right: 0; }
        .immersive-thumbnails-gallery { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; background: rgba(255,255,255,0.7); padding: 0.8rem; border-radius: 4px; backdrop-filter: blur(5px); max-width: 90%; overflow-x: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .gallery-thumb-btn { width: 60px; height: 60px; border: 2px solid transparent; background: #eee; padding: 2px; cursor: pointer; flex-shrink: 0; transition: 0.3s; border-radius: 2px; overflow: hidden; }
        .gallery-thumb-btn img { width: 100%; height: 100%; object-fit: cover; }
        .gallery-thumb-btn.active { border-color: var(--accent-red); transform: translateY(-3px); }
        .immersive-text-pane { flex: 0.6; padding: 6rem 5rem; background: #fff; border-left: 1px solid rgba(0,0,0,0.05); overflow-y: auto; }
        .image-counter { position: absolute; top: 2rem; left: 2.5rem; font-weight: 900; color: #000; font-size: 0.75rem; opacity: 0.2; letter-spacing: 2px; }
        .modal-close-btn { position: absolute; top: 2rem; right: 2rem; background: #eee; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; z-index: 100; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .modal-close-btn:hover { background: var(--accent-red); color: #fff; }
        .detail-title { font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 900; text-transform: uppercase; letter-spacing: -1.5px; line-height: 1; margin-bottom: 2.5rem; }
        .detail-description { font-size: 1.1rem; line-height: 1.8; opacity: 0.7; margin-bottom: 4rem; }
        .detail-legend-box { background: #f9f9f7; padding: 2rem; border-left: 4px solid var(--accent-red); }
        .legend-content { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.2rem; color: #333; }

        @keyframes marquee-rtl { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        @media (max-width: 1100px) {
          .modal-content-card.immersive-modal { flex-direction: column; overflow-y: auto; height: 100vh; width: 100vw; }
          .immersive-grid { flex-direction: column; }
          .immersive-image-pane { height: 60vh; flex: none; width: 100%; padding: 2rem; }
          .immersive-text-pane { flex: none; width: 100%; border-left: none; padding: 4rem 2rem; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-top-row { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .projects-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
        }
        @media (max-width: 600px) {
           .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
           .footer-email-link { font-size: 1.2rem; }
           .footer-bottom { flex-direction: column; gap: 1rem; align-items: flex-start; }
           .projects-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
