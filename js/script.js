// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el);
});

// Variable global para almacenar las herramientas IA
let herramientasIA = [];

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Cargar datos al inicio
async function cargarHerramientas() {
    try {
        console.log('Intentando cargar herramientas desde ias.json...');
        const response = await fetch('../src/ias.json');

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('El archivo JSON no contiene un array válido');
        }
        
        herramientasIA = data;
        console.log(`✅ Herramientas cargadas exitosamente: ${herramientasIA.length} elementos`);
        
        // Mostrar las herramientas cargadas en la consola para debug
        console.log('Herramientas disponibles:', herramientasIA.map(h => h.nombre));
        
    } catch (error) {
        console.error('❌ Error al cargar herramientas:', error);
        
        // Datos de respaldo más completos
        herramientasIA = [
            {
                nombre: "ChatGPT",
                descripcion: "Asistente de IA conversacional avanzado",
                categoria: "Asistente",
                url: "https://chat.openai.com",
                palabrasClave: ["chat", "conversacion", "asistente", "openai"]
            },
            {
                nombre: "Claude",
                descripcion: "Asistente de IA de Anthropic",
                categoria: "Asistente", 
                url: "https://claude.ai",
                palabrasClave: ["asistente", "conversacion", "anthropic"]
            },
            {
                nombre: "Midjourney",
                descripcion: "Generación de imágenes con IA",
                categoria: "Diseño",
                url: "https://midjourney.com",
                palabrasClave: ["imagen", "arte", "diseño", "creatividad"]
            }
        ];
        console.log(`⚠️ Usando datos de respaldo: ${herramientasIA.length} herramientas`);
    }
}

// Función de búsqueda mejorada con mejor algoritmo
function buscarHerramientas(query) {
    if (!query || query.trim() === '') return [];
    
    const termino = normalizeText(query);
    console.log(`🔍 Buscando: "${termino}"`);
    
    const resultados = herramientasIA.filter(item => {
        // Normalizar todos los campos de búsqueda
        const nombre = normalizeText(item.nombre);
        const descripcion = normalizeText(item.descripcion);
        const categoria = normalizeText(item.categoria);
        
        // Búsqueda en nombre (mayor peso)
        const coincideNombre = nombre.includes(termino);
        
        // Búsqueda en descripción
        const coincideDescripcion = descripcion.includes(termino);
        
        // Búsqueda en categoría
        const coincideCategoria = categoria.includes(termino);
        
        // Búsqueda en palabras clave
        let coincidePalabrasClave = false;
        if (item.palabrasClave && Array.isArray(item.palabrasClave)) {
            coincidePalabrasClave = item.palabrasClave.some(palabra => 
                normalizeText(palabra).includes(termino)
            );
        }
        
        const coincide = coincideNombre || coincideDescripcion || coincideCategoria || coincidePalabrasClave;
        
        if (coincide) {
            console.log(`✅ Coincidencia encontrada: ${item.nombre}`);
        }
        
        return coincide;
    });
    
    console.log(`📊 Resultados encontrados: ${resultados.length}`);
    return resultados;
}

// Función para mostrar resultados con mejor diseño
function mostrarResultados(resultados, query) {
    const resultsDiv = document.getElementById('search-results');
    
    if (!resultsDiv) {
        console.error('❌ Elemento search-results no encontrado en el DOM');
        return;
    }
    
    if (resultados.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 2rem; margin-top: 2rem;">
                <h3 style="color: #6b7280; margin-bottom: 1rem;">
                    No se encontraron herramientas para "${query}"
                </h3>
                <p style="color: #9ca3af; margin-bottom: 1rem;">
                    Intenta con términos como:
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">
                    <span class="keyword-tag">IA</span>
                    <span class="keyword-tag">asistente</span>
                    <span class="keyword-tag">diseño</span>
                    <span class="keyword-tag">programación</span>
                    <span class="keyword-tag">escritura</span>
                    <span class="keyword-tag">imagen</span>
                    <span class="keyword-tag">video</span>
                </div>
            </div>
        `;
        return;
    }
    
    resultsDiv.innerHTML = `
        <div class="results-header" style="margin-bottom: 2rem; text-align: center;">
            <h3 style="color: #1f2937; margin-bottom: 0.5rem;">
                ${resultados.length} herramienta${resultados.length > 1 ? 's' : ''} encontrada${resultados.length > 1 ? 's' : ''} para "${query}"
            </h3>
            <p style="color: #6b7280;">Haz clic en cualquier tarjeta para visitar la herramienta</p>
        </div>
        <div class="results-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            ${resultados.map(item => `
                <div class="result-card glass" style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.1)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                   onclick="window.open('${item.url}', '_blank')">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <h4 style="margin: 0; color: #1f2937; font-size: 1.25rem; font-weight: 600;">${item.nombre}</h4>
                        <span class="categoria-badge" style="
                            background: linear-gradient(135deg, #6366f1, #8b5cf6);
                            color: white;
                            padding: 0.25rem 0.75rem;
                            border-radius: 9999px;
                            font-size: 0.75rem;
                            font-weight: 500;
                        ">${item.categoria}</span>
                    </div>
                    <p class="descripcion" style="color:rgb(255, 255, 255); margin-bottom: 1rem; line-height: 1.6;">${item.descripcion}</p>
                    ${item.palabrasClave && item.palabrasClave.length > 0 ? `
                        <div class="keywords" style="margin-bottom: 1rem;">
                            ${item.palabrasClave.slice(0, 4).map(keyword => 
                                `<span class="keyword-tag" style="
                                    background: rgba(99, 102, 241, 0.1);
                                    color: #6366f1;
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 0.375rem;
                                    font-size: 0.75rem;
                                    margin-right: 0.5rem;
                                    margin-bottom: 0.25rem;
                                    display: inline-block;
                                ">${keyword}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                    <div class="btn-visitar" style="
                        color: #6366f1;
                        font-weight: 500;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        margin-top: auto;
                    ">
                        Ver herramienta 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Event listeners mejorados
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, iniciando aplicación...');
    
    // Cargar herramientas al inicio
    cargarHerramientas();
    
    const form = document.querySelector('.search-form, form[role="search"], #search-form');
    const input = document.querySelector('.search-input, input[type="search"], #search-input');
    
    if (!form || !input) {
        console.error('❌ Elementos de búsqueda no encontrados. Buscando alternativas...');
        
        // Buscar elementos alternativos
        const altForm = document.querySelector('form');
        const altInput = document.querySelector('input[type="text"], input[type="search"]');
        
        if (altForm && altInput) {
            console.log('✅ Elementos alternativos encontrados');
            setupSearch(altForm, altInput);
        } else {
            console.error('❌ No se pudieron encontrar elementos de búsqueda');
        }
        return;
    }
    
    setupSearch(form, input);
});

function setupSearch(form, input) {
    console.log('⚙️ Configurando búsqueda...');
    
    // Búsqueda en tiempo real
    let searchTimeout;
    input.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                console.log(`🔄 Búsqueda en tiempo real: "${query}"`);
                const resultados = buscarHerramientas(query);
                mostrarResultados(resultados, query);
            } else if (query.length === 0) {
                const resultsDiv = document.getElementById('search-results');
                if (resultsDiv) {
                    resultsDiv.innerHTML = '';
                }
            }
        }, 500);
    });
    
    // Búsqueda al enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = input.value.trim();
        
        if (!query) {
            alert('Por favor ingresa un término de búsqueda');
            input.focus();
            return;
        }
        
        console.log(`🔍 Búsqueda por submit: "${query}"`);
        const resultados = buscarHerramientas(query);
        mostrarResultados(resultados, query);
        
        // Scroll suave a los resultados
        setTimeout(() => {
            const resultsDiv = document.getElementById('search-results');
            if (resultsDiv) {
                resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    });
    
    console.log('✅ Búsqueda configurada correctamente');
}

// Benefit cards interaction mejorada
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.querySelectorAll('.benefit-card, .category-card, .feature-card').forEach(card => {
            card.addEventListener('click', function() {
                const title = this.querySelector('h3, h4, .title')?.textContent?.trim();
                
                if (title) {
                    console.log(`🎯 Búsqueda por categoría: "${title}"`);
                    const resultados = buscarHerramientas(title);
                    mostrarResultados(resultados, title);
                    
                    // Actualizar el input de búsqueda
                    const input = document.querySelector('.search-input, input[type="search"], #search-input');
                    if (input) {
                        input.value = title;
                    }
                    
                    // Scroll a los resultados
                    setTimeout(() => {
                        const resultsDiv = document.getElementById('search-results');
                        if (resultsDiv) {
                            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }
            });
        });
    }, 1000);
});

// Navbar scroll effect
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar, nav, .header');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            navbar.style.transform = 'translateX(-50%) translateY(-100px)';
        } else {
            navbar.style.transform = 'translateX(-50%) translateY(0)';
        }
        lastScrollY = window.scrollY;
    });
}

// Partículas interactivas
function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: linear-gradient(45deg, #6366f1, #8b5cf6);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.7;
    `;
    
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    
    document.body.appendChild(particle);
    
    const animation = particle.animate([
        { transform: 'translateY(0px)', opacity: 0.7 },
        { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
    ], {
        duration: 3000 + Math.random() * 2000,
        easing: 'linear'
    });
    
    animation.onfinish = () => particle.remove();
}

// Crear partículas periódicamente (solo en desktop)
if (window.innerWidth > 768) {
    setInterval(createParticle, 500);
}

// Debug: Función para probar la búsqueda desde la consola
window.testSearch = function(query) {
    console.log(`🧪 Prueba de búsqueda: "${query}"`);
    const resultados = buscarHerramientas(query);
    console.log('Resultados:', resultados);
    mostrarResultados(resultados, query);
};

// Variables y funciones para el formulario de compra
let selectedPlan = '';

function openPurchaseModal(plan) {
    selectedPlan = plan;
    document.getElementById('purchaseModal').style.display = 'flex';
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').style.display = 'none';
}

document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
        plan: selectedPlan,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        direccion: document.getElementById('direccion').value,
        cedula: document.getElementById('cedula').value,
        fecha: new Date().toISOString()
    };
    
    // Guardar en localStorage
    localStorage.setItem('compraIA', JSON.stringify(data));
    
    alert('¡Compra registrada exitosamente!\nDatos guardados:\n' + JSON.stringify(data, null, 2));
    closePurchaseModal();
    this.reset();
});

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    if (event.target === document.getElementById('purchaseModal')) {
        closePurchaseModal();
    }
}