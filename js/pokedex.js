// Global variables
let currentOffset = 0;
const limit = 20;
let allPokemon = [];
let isLoading = false;
let currentTypeFilter = '';

// DOM elements
const pokemonContainer = document.getElementById('pokemonContainer');
const loadingIndicator = document.getElementById('loading');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const typeFilter = document.getElementById('typeFilter');

// Initialize the PokeDex
document.addEventListener('DOMContentLoaded', () => {
  loadPokemon();
  
  // Event listeners
  loadMoreBtn.addEventListener('click', loadMorePokemon);
  searchButton.addEventListener('click', searchPokemon);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchPokemon();
    }
  });
  typeFilter.addEventListener('change', filterByType);
  
  // Logo click event to play sound and change background
  document.querySelector('.navbar-brand').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Play the Pikachu sound
    const audio = document.getElementById('audioElement');
    audio.currentTime = 0; // Restart sound if already playing
    audio.play();
    
    // Change background to gif
    document.body.style.backgroundImage = "url('images/gif1.gif')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundColor = "black";
    
    // Change container background for better readability
    const containers = document.querySelectorAll('.card, .search-container, .modal-content');
    containers.forEach(container => {
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      container.style.color = 'white';
    });
    
    // Apply some fun effects
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5');
    headings.forEach(heading => {
      heading.style.color = '#ffcb05'; // Pokemon yellow
      heading.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
    });
  });
});

// Fetch Pokemon list from API
async function loadPokemon(reset = false) {
  if (isLoading) return;
  
  isLoading = true;
  loadingIndicator.style.display = 'block';
  
  if (reset) {
    currentOffset = 0;
    pokemonContainer.innerHTML = '';
    allPokemon = [];
  }
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`);
    const data = await response.json();
    
    const pokemonDetailsPromises = data.results.map(pokemon => 
      fetch(pokemon.url).then(res => res.json())
    );
    
    const pokemonDetails = await Promise.all(pokemonDetailsPromises);
    allPokemon = [...allPokemon, ...pokemonDetails];
    
    renderPokemonCards(pokemonDetails);
    currentOffset += limit;
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    pokemonContainer.innerHTML += `
      <div class="col-12 text-center">
        <div class="alert alert-danger">
          Error al cargar Pokémon. Por favor, intenta de nuevo más tarde.
        </div>
      </div>
    `;
  } finally {
    isLoading = false;
    loadingIndicator.style.display = 'none';
  }
}

// Load more Pokemon when button is clicked
function loadMorePokemon() {
  loadPokemon();
}

// Create and render Pokemon cards
function renderPokemonCards(pokemonList) {
  pokemonList.forEach(pokemon => {
    const types = pokemon.types.map(type => type.type.name);
    const mainType = types[0];
    
    // Calculate stats
    const stats = {};
    pokemon.stats.forEach(stat => {
      stats[stat.stat.name] = stat.base_stat;
    });
    
    const pokemonCard = document.createElement('div');
    pokemonCard.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
    pokemonCard.innerHTML = `
      <div class="pokemon-card" data-id="${pokemon.id}" data-name="${pokemon.name}" data-types='${JSON.stringify(types)}'>
        <div class="pokemon-img-container">
          <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
               alt="${pokemon.name}">
        </div>
        <div class="pokemon-info">
          <p class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</p>
          <h3 class="pokemon-name">${pokemon.name}</h3>
          <div class="pokemon-types">
            ${types.map(type => `<span class="pokemon-type ${type}">${type}</span>`).join('')}
          </div>
          <div class="pokemon-stats">
            <div class="row">
              <div class="col-6">
                <small>HP</small>
                <div class="progress">
                  <div class="progress-bar bg-success" role="progressbar" style="width: ${stats.hp / 2}%" 
                       aria-valuenow="${stats.hp}" aria-valuemin="0" aria-valuemax="200"></div>
                </div>
              </div>
              <div class="col-6">
                <small>ATK</small>
                <div class="progress">
                  <div class="progress-bar bg-danger" role="progressbar" style="width: ${stats.attack / 2}%" 
                       aria-valuenow="${stats.attack}" aria-valuemin="0" aria-valuemax="200"></div>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm mt-2 add-to-cart-pokemon" 
                  data-name="Pokémon ${pokemon.name}" 
                  data-price="9.99">
            Comprar Pokémon ($9.99)
          </button>
          <button class="btn btn-outline-primary btn-sm mt-2 view-details">
            Ver detalles
          </button>
        </div>
      </div>
    `;
    
    pokemonContainer.appendChild(pokemonCard);
    
    // Add event listener for the view details button
    const viewDetailsBtn = pokemonCard.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', () => showPokemonDetails(pokemon));
    
    // Add event listener for the add to cart button
    const addToCartBtn = pokemonCard.querySelector('.add-to-cart-pokemon');
    addToCartBtn.addEventListener('click', () => {
      const name = addToCartBtn.getAttribute('data-name');
      const price = parseFloat(addToCartBtn.getAttribute('data-price'));
      const existing = cart.find(item => item.name === name);
      
      if (existing) { 
        existing.quantity++; 
      } else { 
        cart.push({ name, price, quantity: 1 }); 
      }
      
      // Show a notification
      const toast = document.createElement('div');
      toast.className = 'position-fixed bottom-0 end-0 p-3';
      toast.style.zIndex = '5';
      toast.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header">
            <strong class="me-auto">DuckifyPokeDex</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
          </div>
          <div class="toast-body">
            "${name}" agregado al carrito
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      updateCart();
    });
  });
}

// Search Pokemon by name
async function searchPokemon() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (!searchTerm) {
    pokemonContainer.innerHTML = '';
    loadPokemon(true);
    return;
  }
  
  isLoading = true;
  loadingIndicator.style.display = 'block';
  pokemonContainer.innerHTML = '';
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
    
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    
    const pokemon = await response.json();
    renderPokemonCards([pokemon]);
  } catch (error) {
    console.error('Error searching Pokemon:', error);
    pokemonContainer.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-warning">
          No se encontró ningún Pokémon con el nombre "${searchTerm}".
        </div>
      </div>
    `;
  } finally {
    isLoading = false;
    loadingIndicator.style.display = 'none';
  }
}

// Filter Pokemon by type
async function filterByType() {
  const selectedType = typeFilter.value;
  currentTypeFilter = selectedType;
  
  if (!selectedType) {
    pokemonContainer.innerHTML = '';
    loadPokemon(true);
    return;
  }
  
  isLoading = true;
  loadingIndicator.style.display = 'block';
  pokemonContainer.innerHTML = '';
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
    const data = await response.json();
    
    const pokemonUrls = data.pokemon.slice(0, 20).map(p => p.pokemon.url);
    
    const pokemonDetailsPromises = pokemonUrls.map(url => 
      fetch(url).then(res => res.json())
    );
    
    const pokemonDetails = await Promise.all(pokemonDetailsPromises);
    renderPokemonCards(pokemonDetails);
  } catch (error) {
    console.error('Error filtering Pokemon by type:', error);
    pokemonContainer.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-danger">
          Error al filtrar Pokémon. Por favor, intenta de nuevo más tarde.
        </div>
      </div>
    `;
  } finally {
    isLoading = false;
    loadingIndicator.style.display = 'none';
  }
}

// Show Pokemon details in modal
async function showPokemonDetails(pokemon) {
  const modalTitle = document.getElementById('modalPokemonName');
  const modalContent = document.getElementById('modalContent');
  
  modalTitle.textContent = pokemon.name.toUpperCase();
  modalTitle.style.textTransform = 'capitalize';
  
  const types = pokemon.types.map(type => type.type.name);
  const mainType = types[0];
  
  // Set modal header color based on pokemon type
  const modalHeader = document.querySelector('.pokemon-detail-header');
  modalHeader.style.backgroundColor = getTypeColor(mainType);
  
  // Get additional Pokemon species data
  let speciesData = {};
  try {
    const speciesResponse = await fetch(pokemon.species.url);
    speciesData = await speciesResponse.json();
  } catch (error) {
    console.error('Error fetching species data:', error);
  }
  
  // Get flavor text (description)
  let description = 'No hay información disponible para este Pokémon.';
  if (speciesData.flavor_text_entries) {
    const spanishText = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    const englishText = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    description = (spanishText || englishText)?.flavor_text || description;
  }
  
  // Prepare abilities
  const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');
  
  // Calculate stats
  const stats = {};
  pokemon.stats.forEach(stat => {
    stats[stat.stat.name] = stat.base_stat;
  });
  
  modalContent.innerHTML = `
    <div class="row">
      <div class="col-md-6 text-center">
        <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
             alt="${pokemon.name}" class="pokemon-detail-img">
        <div class="mt-3">
          ${types.map(type => `<span class="pokemon-type ${type}">${type}</span>`).join('')}
        </div>
      </div>
      <div class="col-md-6 pokemon-detail-info">
        <p><strong>Número:</strong> #${pokemon.id.toString().padStart(3, '0')}</p>
        <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Descripción:</strong> ${description}</p>
        
        <h5 class="mt-3">Habilidades</h5>
        <div class="pokemon-abilities">
          ${pokemon.abilities.map(ability => 
            `<span>${ability.ability.name}</span>`
          ).join('')}
        </div>
        
        <h5 class="mt-3">Estadísticas</h5>
        <div class="row">
          <div class="col-md-6">
            <p><small>HP: ${stats.hp}</small></p>
            <div class="progress mb-3">
              <div class="progress-bar bg-success" role="progressbar" 
                   style="width: ${stats.hp / 2}%" 
                   aria-valuenow="${stats.hp}" aria-valuemin="0" aria-valuemax="200"></div>
            </div>
          </div>
          <div class="col-md-6">
            <p><small>Ataque: ${stats.attack}</small></p>
            <div class="progress mb-3">
              <div class="progress-bar bg-danger" role="progressbar" 
                   style="width: ${stats.attack / 2}%" 
                   aria-valuenow="${stats.attack}" aria-valuemin="0" aria-valuemax="200"></div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <p><small>Defensa: ${stats.defense}</small></p>
            <div class="progress mb-3">
              <div class="progress-bar bg-warning" role="progressbar" 
                   style="width: ${stats.defense / 2}%" 
                   aria-valuenow="${stats.defense}" aria-valuemin="0" aria-valuemax="200"></div>
            </div>
          </div>
          <div class="col-md-6">
            <p><small>Velocidad: ${stats.speed}</small></p>
            <div class="progress mb-3">
              <div class="progress-bar bg-info" role="progressbar" 
                   style="width: ${stats.speed / 2}%" 
                   aria-valuenow="${stats.speed}" aria-valuemin="0" aria-valuemax="200"></div>
            </div>
          </div>
        </div>
        
        <button class="btn btn-primary mt-3 add-to-cart-pokemon" 
                data-name="Pokémon ${pokemon.name}" 
                data-price="9.99">
          Comprar Pokémon ($9.99)
        </button>
      </div>
    </div>
  `;
  
  // Add event listener for the add to cart button in modal
  const addToCartBtn = modalContent.querySelector('.add-to-cart-pokemon');
  addToCartBtn.addEventListener('click', () => {
    const name = addToCartBtn.getAttribute('data-name');
    const price = parseFloat(addToCartBtn.getAttribute('data-price'));
    const existing = cart.find(item => item.name === name);
    
    if (existing) { 
      existing.quantity++; 
    } else { 
      cart.push({ name, price, quantity: 1 }); 
    }
    
    // Show a notification
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '5';
    toast.innerHTML = `
      <div class="toast show" role="alert">
        <div class="toast-header">
          <strong class="me-auto">DuckifyPokeDex</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          "${name}" agregado al carrito
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    
    updateCart();
  });
  
  // Show the modal
  const pokemonModal = new bootstrap.Modal(document.getElementById('pokemonDetailModal'));
  pokemonModal.show();
}

// Helper function to get color based on Pokemon type
function getTypeColor(type) {
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };
  
  return typeColors[type] || '#A8A878';
}
