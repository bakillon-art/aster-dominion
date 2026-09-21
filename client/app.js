const defaultPlayerId = 'player-demo';
const apiBaseUrl = 'http://localhost:3001';

const playerIdInput = document.querySelector('#player-id');
const loadButton = document.querySelector('#load-demo');
const buildButton = document.querySelector('#build-button');
const fleetButton = document.querySelector('#fleet-button');
const buildingSelect = document.querySelector('#building-type');
const shipSelect = document.querySelector('#ship-type');
const fleetQuantityInput = document.querySelector('#fleet-quantity');

const elements = {
  phase: document.querySelector('#phase'),
  planetName: document.querySelector('#planet-name'),
  playerName: document.querySelector('#player-name'),
  metal: document.querySelector('#metal'),
  crystal: document.querySelector('#crystal'),
  deuterium: document.querySelector('#deuterium'),
  energy: document.querySelector('#energy'),
  productionList: document.querySelector('#production-list'),
  fleetTotal: document.querySelector('#fleet-total'),
  fleetTypes: document.querySelector('#fleet-types'),
  totalResources: document.querySelector('#total-resources'),
  totalProduction: document.querySelector('#total-production'),
};

const formatNumber = (value) => Number(value ?? 0).toLocaleString('es-ES');

function getCurrentPlayerId() {
  return playerIdInput.value.trim() || defaultPlayerId;
}

function renderProduction(production) {
  const rows = [
    { label: 'Metal', value: production.metal },
    { label: 'Crystal', value: production.crystal },
    { label: 'Deuterio', value: production.deuterium },
    { label: 'Energía', value: production.energy },
  ];

  elements.productionList.innerHTML = rows
    .map(
      (entry) => `
        <li>
          <span>${entry.label}</span>
          <strong>${formatNumber(entry.value)}</strong>
        </li>
      `,
    )
    .join('');
}

function renderFleet(fleetSummary) {
  const total = Number(fleetSummary?.totalShips ?? 0);
  elements.fleetTotal.textContent = formatNumber(total);

  if (!fleetSummary?.shipTypes?.length) {
    elements.fleetTypes.innerHTML = '<span class="fleet-type-tag">Sin flotas activas</span>';
    return;
  }

  elements.fleetTypes.innerHTML = fleetSummary.shipTypes
    .map(
      (item) => `<span class="fleet-type-tag">${item.type}: ${formatNumber(item.quantity)}</span>`,
    )
    .join('');
}

function renderDashboard(payload) {
  const resources = payload.resources ?? {};
  const production = payload.production ?? {};

  elements.phase.textContent = payload.status?.phase ?? 'unknown';
  elements.planetName.textContent = payload.planet?.name ?? 'Sistema sin nombre';
  elements.playerName.textContent = payload.player?.username ?? 'demo-player';

  elements.metal.textContent = formatNumber(resources.metal);
  elements.crystal.textContent = formatNumber(resources.crystal);
  elements.deuterium.textContent = formatNumber(resources.deuterium);
  elements.energy.textContent = formatNumber(resources.energy);

  renderProduction(production);
  renderFleet(payload.fleetSummary);

  const totalResources = Number(payload.economy?.totalResources ?? 0);
  const totalProduction = Number(payload.economy?.totalProduction ?? 0);
  elements.totalResources.textContent = formatNumber(totalResources);
  elements.totalProduction.textContent = formatNumber(totalProduction);
}

async function loadDashboard(playerId = getCurrentPlayerId()) {
  try {
    const response = await fetch(`${apiBaseUrl}/demo/dashboard/${playerId}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    elements.phase.textContent = 'error';
    elements.playerName.textContent = error instanceof Error ? error.message : 'No se pudo cargar';
    elements.planetName.textContent = 'Backend no disponible';
    elements.fleetTypes.innerHTML = '<span class="fleet-type-tag">Revisa el servidor</span>';
  }
}

async function buildBuilding() {
  const playerId = getCurrentPlayerId();
  const buildingType = buildingSelect.value;

  try {
    const response = await fetch(`${apiBaseUrl}/demo/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, buildingType }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Build failed');
    }

    loadDashboard(playerId);
  } catch (error) {
    elements.phase.textContent = 'build-error';
    elements.playerName.textContent = error instanceof Error ? error.message : 'No se pudo construir';
  }
}

async function createFleet() {
  const playerId = getCurrentPlayerId();
  const shipType = shipSelect.value;
  const quantity = Number(fleetQuantityInput.value || 1);

  try {
    const response = await fetch(`${apiBaseUrl}/demo/fleet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, shipType, quantity }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Fleet creation failed');
    }

    loadDashboard(playerId);
  } catch (error) {
    elements.phase.textContent = 'fleet-error';
    elements.playerName.textContent = error instanceof Error ? error.message : 'No se pudo crear la flota';
  }
}

loadButton.addEventListener('click', () => loadDashboard(getCurrentPlayerId()));
loadButton.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadDashboard(getCurrentPlayerId());
  }
});

playerIdInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadDashboard(getCurrentPlayerId());
  }
});

buildButton.addEventListener('click', buildBuilding);
fleetButton.addEventListener('click', createFleet);

loadDashboard(defaultPlayerId);
