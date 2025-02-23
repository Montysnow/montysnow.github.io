// 初始数据
const initialData = [
    {
        name: "GitHub",
        url: "https://github.com",
        favicon: "https://api.iowen.cn/favicon/github.com.png", // 使用更快的服务
        category: "工作",
        description: "代码托管平台",
        themeColor: "#24292e"
    }
];

// 获取存储的数据或使用初始数据
let sites = JSON.parse(localStorage.getItem('sites')) || initialData;

// 删除模式状态
let isDeleteMode = false;

// 添加编辑模式状态
let isEditMode = false;
let currentEditSite = null;

// 删除按钮事件
const deleteBtn = document.getElementById('deleteBtn');
deleteBtn.addEventListener('click', () => {
    isDeleteMode = !isDeleteMode;
    deleteBtn.classList.toggle('active');
    document.querySelectorAll('.card').forEach(card => {
        card.classList.toggle('delete-mode');
    });
});

// 编辑按钮事件
const editBtn = document.getElementById('editBtn');
const editModal = document.getElementById('editModal');

editBtn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    editBtn.classList.toggle('active');
    document.querySelectorAll('.card').forEach(card => {
        card.classList.toggle('edit-mode');
    });
});

// 添加预设颜色数组
const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
    '#1ABC9C', '#F1C40F', '#E74C3C', '#34495E', '#95A5A6',
    '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#F39C12'
];

// 创建颜色选择器
function createColorPicker(container, initialColor, onSelect) {
    const colorGrid = container.querySelector('.color-grid');
    colorGrid.innerHTML = '';
    
    presetColors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-btn' + (color === initialColor ? ' selected' : '');
        btn.style.backgroundColor = color;
        btn.type = 'button';
        
        btn.addEventListener('click', () => {
            container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            onSelect(color);
        });
        
        colorGrid.appendChild(btn);
    });
}

// 修改添加表单的颜色选择
let selectedAddColor = presetColors[0];
createColorPicker(
    document.getElementById('addModal'),
    selectedAddColor,
    color => selectedAddColor = color
);

// 修改编辑表单的颜色选择
let selectedEditColor = presetColors[0];
createColorPicker(
    document.getElementById('editModal'),
    selectedEditColor,
    color => selectedEditColor = color
);

// 修改添加网站的处理函数
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('urlInput').value;
    const name = document.getElementById('nameInput').value;
    const category = document.getElementById('categoryInput').value;
    
    const newSite = {
        name,
        url,
        category,
        themeColor: selectedAddColor
    };
    
    sites.push(newSite);
    localStorage.setItem('sites', JSON.stringify(sites));
    renderCards();
    modal.style.display = 'none';
    e.target.reset();
    
    // 重置颜色选择器
    selectedAddColor = presetColors[0];
    createColorPicker(
        document.getElementById('addModal'),
        selectedAddColor,
        color => selectedAddColor = color
    );
});

// 修改编辑表单处理
document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentEditSite) {
        currentEditSite.name = document.getElementById('editNameInput').value;
        currentEditSite.category = document.getElementById('editCategoryInput').value;
        currentEditSite.themeColor = selectedEditColor;
        localStorage.setItem('sites', JSON.stringify(sites));
        renderCards();
        editModal.style.display = 'none';
        currentEditSite = null;
    }
});

// 修改编辑模式的打开处理
function openEditModal(site) {
    currentEditSite = site;
    document.getElementById('editNameInput').value = site.name;
    document.getElementById('editCategoryInput').value = site.category;
    selectedEditColor = site.themeColor || presetColors[0];
    createColorPicker(document.getElementById('editModal'), selectedEditColor, color => selectedEditColor = color);
    editModal.style.display = 'block';
}

// 添加拖拽相关变量
let draggedItem = null;
let draggedIndex = null;

// 修改渲染卡片函数，添加拖拽功能
function renderCards(filteredSites = sites) {
    const grid = document.querySelector('.card-grid');
    grid.innerHTML = '';
    
    // 记录当前显示的卡片在原数组中的索引
    const siteIndices = filteredSites.map(site => sites.indexOf(site));
    
    filteredSites.forEach((site, displayIndex) => {
        const card = document.createElement('div');
        card.className = 'card';
        if (isDeleteMode) {
            card.classList.add('delete-mode');
        }
        if (isEditMode) {
            card.classList.add('edit-mode');
        }
        
        // 添加拖拽属性
        card.draggable = true;
        card.dataset.index = siteIndices[displayIndex]; // 使用在原数组中的索引
        
        // 设置卡片的背景色
        const color = site.themeColor || '#4a9eff';
        card.style.setProperty('--site-color', color);
        
        // 添加拖拽事件监听器
        card.addEventListener('dragstart', (e) => {
            if (!isDeleteMode && !isEditMode) {
                draggedItem = card;
                draggedIndex = parseInt(card.dataset.index); // 使用原数组索引
                e.dataTransfer.effectAllowed = 'move';
                card.classList.add('dragging');
            }
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedItem = null;
            draggedIndex = null;
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!isDeleteMode && !isEditMode) {
                e.dataTransfer.dropEffect = 'move';
            }
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!isDeleteMode && !isEditMode && draggedItem && draggedItem !== card) {
                const dropIndex = parseInt(card.dataset.index);
                // 重新排序
                const temp = sites[draggedIndex];
                sites.splice(draggedIndex, 1);
                sites.splice(dropIndex, 0, temp);
                // 保存新顺序
                localStorage.setItem('sites', JSON.stringify(sites));
                // 重新渲染当前分类
                const currentCategory = document.querySelector('.category-btn.active').dataset.category;
                const newFilteredSites = currentCategory === 'all' 
                    ? sites 
                    : sites.filter(site => site.category === currentCategory);
                renderCards(newFilteredSites);
            }
        });
        
        // 修改点击事件
        card.addEventListener('click', () => {
            if (isDeleteMode) {
                if (confirm(`确定要删除 "${site.name}" 吗？`)) {
                    sites = sites.filter(s => s.url !== site.url);
                    localStorage.setItem('sites', JSON.stringify(sites));
                    renderCards();
                }
            } else if (isEditMode) {
                openEditModal(site);
            } else {
                window.open(site.url, '_blank');
            }
        });
        
        card.innerHTML = `
            <div class="card-info">
                <div class="card-title">${site.name}</div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// 分类过滤
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.category-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        const filteredSites = category === 'all' 
            ? sites 
            : sites.filter(site => site.category === category);
        
        renderCards(filteredSites);
    });
});

// 添加网站模态框
const modal = document.getElementById('addModal');
const addBtn = document.getElementById('addBtn');
const closeBtn = document.querySelector('.close-btn');

addBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    // 重新初始化添加表单的颜色选择器
    selectedAddColor = presetColors[0];
    createColorPicker(
        document.getElementById('addModal'),
        selectedAddColor,
        color => selectedAddColor = color
    );
});

// 搜索功能
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    const engine = document.getElementById('searchEngine').value;
    
    if (!query) return;
    
    const searchUrls = {
        baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`
    };
    
    window.open(searchUrls[engine], '_blank');
});

// 初始渲染
renderCards(); 