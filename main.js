import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 🔌 Supabase Setup
// Initialize connection to Supabase using project URL + anon key
const supabaseUrl = 'https://qnceucksnoskacjntvgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuY2V1Y2tzbm9za2Fjam50dmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTY2NzYsImV4cCI6MjA5MTA3MjY3Nn0.aPFMGlUEq4apUKvs_dMPShHN8WXS0gSd0UfPdAcXOPs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 📦 Game State Variables
// unlockedElements: elements the player can currently use
// allElements: full dataset from database
// allCombinations: all valid element pairings
let unlockedElements = [];
let allElements = [];
let allCombinations = [];

// 🚀 Initial Data Load
// Fetch elements + combinations from Supabase when page loads
// Then initialize starting elements and UI
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data: elements, error: elemErr } = await supabase.from('elements').select('*');
    if (elemErr) throw elemErr;
    allElements = elements;

    const { data: combos, error: comboErr } = await supabase.from('combinations').select('*');
    if (comboErr) throw comboErr;
    allCombinations = combos;

    // Start player with first 10 elements
    unlockedElements = allElements.slice(0, 10);

    populateDropdowns();
    updateUnlockedList();

    document.getElementById('combineBtn').addEventListener('click', combineElements);

  } catch (err) {
    console.error("Supabase fetch error:", err);
    alert("Failed to fetch data from Supabase. Check your anon key and permissions.");
  }
});

// 🔽 UI: Dropdown Population
// Fill both dropdown menus with currently unlocked elements
function populateDropdowns() {
  const select1 = document.getElementById('element1');
  const select2 = document.getElementById('element2');

  select1.innerHTML = '<option value="">Select first element</option>';
  select2.innerHTML = '<option value="">Select second element</option>';

  unlockedElements.forEach(e => {
    const opt1 = document.createElement('option');
    opt1.value = e.id;
    opt1.textContent = e.element_name;
    select1.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = e.id;
    opt2.textContent = e.element_name;
    select2.appendChild(opt2);
  });
}

// 📜 UI: Unlocked List Display
// Update visible list of discovered elements
function updateUnlockedList() {
  const ul = document.getElementById('unlockedList');
  ul.innerHTML = '';

  unlockedElements.forEach(e => {
    const li = document.createElement('li');
    li.textContent = e.element_name;
    ul.appendChild(li);
  });
}

// 🧪 Core Mechanic: Combine Elements
// Handles:
// - Reading selected elements
// - Checking for valid combinations
// - Unlocking new elements
// - Updating UI + feedback
function combineElements() {
  const e1Id = parseInt(document.getElementById('element1').value);
  const e2Id = parseInt(document.getElementById('element2').value);

  // Validate selection
  if (!e1Id || !e2Id) {
    document.getElementById('result').textContent = "Please select two elements.";
    return;
  }

  const e1 = unlockedElements.find(e => e.id === e1Id);
  const e2 = unlockedElements.find(e => e.id === e2Id);

  // Find matching combination (order doesn't matter)
  const combo = allCombinations.find(c =>
    (c.element1_id === e1.id && c.element2_id === e2.id) ||
    (c.element1_id === e2.id && c.element2_id === e1.id)
  );

  // No valid result
  if (!combo) {
    document.getElementById('result').textContent =
      `${e1.element_name} + ${e2.element_name} → nothing happens`;
    return;
  }

  const result = allElements.find(e => e.id === combo.result_id);

  // Unlock new element if not already discovered
  if (!unlockedElements.find(e => e.id === result.id)) {
    unlockedElements.push(result);
    document.getElementById('result').textContent =
      `🎉 New element unlocked: ${result.element_name}`;

    populateDropdowns();
    updateUnlockedList();
  } else {
    document.getElementById('result').textContent =
      `${result.element_name} is already unlocked`;
  }
}
