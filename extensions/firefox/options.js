const extAPI = typeof browser !== 'undefined' && browser.storage ? browser : null;

const storageAPI = {
    get: (keys, callback) => {
        if (!extAPI) return callback(typeof keys === 'string' ? {} : Array.isArray(keys) ? {} : {});
        extAPI.storage.sync.get(keys, callback);
    },
    set: (items, callback = () => { }) => {
        if (!extAPI) return;
        extAPI.storage.sync.set(items, callback);
    },
    onChanged: extAPI?.storage.onChanged,
};

const DEFAULT_KEYWORDS = ['PURETECH', 'VTI', 'THP'];

function saveKeywords(keywords) {
  storageAPI.set({ keywords }, () => {
    setStatus('Saved.', 'green');
  });
}

function loadKeywords(callback) {
  storageAPI.get(['keywords'], (result) => {
    const keywords = result.keywords || DEFAULT_KEYWORDS;
    callback(keywords);
  });
}

function setStatus(text, color = 'black') {
  const status = document.getElementById('status');
  status.textContent = text;
  status.style.color = color;
  setTimeout(() => {
    if (status.textContent === text) status.textContent = '';
  }, 2000);
}

function renderKeywords(keywords) {
  const list = document.getElementById('keywordList');
  list.innerHTML = '';
  
  const fragment = document.createDocumentFragment();
  
  keywords.forEach((kw, i) => {
    const li = document.createElement('li');
    
    const keywordText = document.createTextNode(kw);
    li.appendChild(keywordText);
    
    const removeSpan = document.createElement('span');
    removeSpan.className = 'remove';
    removeSpan.setAttribute('data-index', i);
    removeSpan.textContent = '×';
    
    li.appendChild(removeSpan);
    fragment.appendChild(li);
  });
  
  list.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', () => {
  loadKeywords((keywords) => {
    renderKeywords(keywords);
  });

  document.getElementById('addBtn').addEventListener('click', () => {
    const input = document.getElementById('keywordInput');
    const value = input.value.trim().toUpperCase();
    if (!value) return;
    loadKeywords((keywords) => {
      if (!keywords.includes(value)) {
        keywords.push(value);
        saveKeywords(keywords);
        renderKeywords(keywords);
        input.value = '';
      } else {
        setStatus(`${value} is already present.`, 'orange');
      }
    });
  });

  document.getElementById('keywordList').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
      const index = parseInt(e.target.dataset.index);
      loadKeywords((keywords) => {
        keywords.splice(index, 1);
        saveKeywords(keywords);
        renderKeywords(keywords);
      });
    }
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    saveKeywords([...DEFAULT_KEYWORDS]);
    renderKeywords(DEFAULT_KEYWORDS);
  });
});