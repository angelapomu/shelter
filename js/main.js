document.addEventListener('DOMContentLoaded', function() {

    // --- Page 1 Logic: Navigation & Data Persistence ---
    const goToStepBtn = document.getElementById('go-to-step-btn');
    if (goToStepBtn) { // This confirms we are on Page 1
        const goToTentBtn = document.getElementById('go-to-tent-btn');
        const procrastinationInput = document.getElementById('procrastination-input');
        const thoughtsInput = document.getElementById('thoughts-input');
        function savePage1Inputs() { localStorage.setItem('procrastinationText', procrastinationInput.value); localStorage.setItem('thoughtsText', thoughtsInput.value); }
        function loadPage1Inputs() { procrastinationInput.value = localStorage.getItem('procrastinationText') || ''; thoughtsInput.value = localStorage.getItem('thoughtsText') || ''; }
        const plusIconLink = document.querySelector('.plus-icon');
        if(plusIconLink) { plusIconLink.addEventListener('click', savePage1Inputs); }
        goToStepBtn.addEventListener('click', () => { savePage1Inputs(); window.location.href = 'page5.html'; });
        goToTentBtn.addEventListener('click', () => { savePage1Inputs(); localStorage.setItem('isFireLit', 'false'); localStorage.setItem('isChairPlaced', 'false'); window.location.href = 'page2.html'; });
        loadPage1Inputs();
    }

    // --- Page 2 Logic: Sequential Text Reveal ---
    const page2Container = document.getElementById('page2-container');
    if (page2Container) {
        const text1 = document.getElementById('text-1');
        const text2 = document.getElementById('text-2');
        const text3 = document.getElementById('text-3');
        const enterTentBtn = document.getElementById('enter-tent-btn-p2');
        const windSound = document.getElementById('wind-sound');
        
        let clickStep = 0;

        page2Container.addEventListener('click', function(event) {
            // 防止点击按钮时，也触发背景的点击事件
            if (event.target.id === 'enter-tent-btn-p2') {
                return;
            }
            clickStep++;
            switch (clickStep) {
                case 1:
                    text1.classList.add('visible');
                    windSound.play().catch(e => console.error("Wind sound failed:", e));
                    break;
                case 2:
                    text2.classList.add('visible');
                    break;
                case 3:
                    text3.classList.add('visible');
                    enterTentBtn.classList.add('visible');
                    break;
            }
        });
    }

    // --- Page 3 Logic: New Tent Interaction ---
const tentContainer = document.getElementById('tent-container');
if (tentContainer) {
    // --- 获取元素 ---
    const spawnSound = document.getElementById('spawn-sound');
    // (其他元素获取...)
    const eatingSound = document.getElementById('eating-sound');
    const inventoryFood = document.getElementById('inventory-food');
    const eatAllBtn = document.getElementById('eat-all-btn');
    const fireStartSound = document.getElementById('fire-start-sound');
    const fireLoopSound = document.getElementById('fire-loop-sound');
    const woodItem = document.getElementById('item-wood');
    const chairItem = document.getElementById('item-chair');
    const tentBackground = document.getElementById('tent-background');
    const chatLink = document.getElementById('chat-link');
    const windMuffledSound = document.getElementById('wind-muffled-sound');
    
    // --- 新增：一个可以播放音频片段的函数 ---
    /**
     * 播放一个音频元素的一部分。
     * @param {HTMLAudioElement} audioElement - 要播放的<audio>元素。
     * @param {number} startTime - 开始播放的时间点（秒）。
     * @param {number} duration - 要播放的时长（秒）。
     */
    function playAudioSegment(audioElement, startTime, duration) {
        audioElement.currentTime = startTime; // 1. 把播放头跳到开始位置
        audioElement.play(); // 2. 开始播放

        // 3. 设置一个定时器，在指定的时长后停止播放
        setTimeout(() => {
            audioElement.pause(); // 暂停播放
        }, duration * 1000); // duration是秒，setTimeout需要毫秒
    }

    // --- 声音控制 ---
    windMuffledSound.volume = 0.1;
    windMuffledSound.play().catch(e => {});

    // --- 核心功能 1：生成食物 ---
    inventoryFood.addEventListener('click', function(event) {
    if (event.target.classList.contains('food-emoji-source')) {
          // --- 新增：百度统计事件跟踪 ---
        _hmt.push(['_trackEvent', 'p3_tent_interaction', 'click', 'spawn_food']);
        // 正确：现在“生成”时，播放简单的 spawnSound
        spawnSound.currentTime = 0;
        spawnSound.play();

        const foodSrc = event.target.src;
        const newEmoji = document.createElement('img');
        newEmoji.src = foodSrc;
        newEmoji.className = 'eatable-emoji';
        
        const maxX = tentContainer.clientWidth - 50;
        const maxY = tentContainer.clientHeight - 250;
        newEmoji.style.left = `${Math.random() * maxX}px`;
        newEmoji.style.top = `${Math.random() * maxY}px`;

        newEmoji.addEventListener('click', function() {
            // 正确：现在“吃掉”时，播放需要被截取前1秒的 eatingSound
            playAudioSegment(eatingSound, 0, 1); 
            
            newEmoji.style.opacity = '0';
            newEmoji.style.transform = 'scale(0.5)';
            setTimeout(() => { newEmoji.remove(); }, 300);
        });
        tentContainer.appendChild(newEmoji);
    }
});

// --- 核心功能 2：一口气吃掉所有食物 ---
eatAllBtn.addEventListener('click', function() {
    const allEatableEmojis = document.querySelectorAll('.eatable-emoji');
    if (allEatableEmojis.length > 0) {
        // --- 新增：百度统计事件跟踪 ---
        _hmt.push(['_trackEvent', 'p3_tent_interaction', 'click', 'eat_all_food']);

        // 正确：“一口气吃掉”时，也播放需要被截取前1秒的 eatingSound
        playAudioSegment(eatingSound, 0, 1);

        allEatableEmojis.forEach(emoji => {
            emoji.style.opacity = '0';
            emoji.style.transform = 'scale(0.5)';
            setTimeout(() => { emoji.remove(); }, 300);
        });
    }
});

    // --- 状态管理 & 交互事件 ---
let isFireLit = localStorage.getItem('isFireLit') === 'true';
let isChairPlaced = localStorage.getItem('isChairPlaced') === 'true';

// 唯一的、正确的 updateTentVisuals 函数
function updateTentVisuals() {
    // --- 新增：每日食物逻辑 ---
const dailyFoodContainer = document.getElementById('daily-food-container');
if (dailyFoodContainer) {
    const lastCheckDate = localStorage.getItem('lastCheckDate');
    const today = new Date().toLocaleDateString();

    // 如果今天是新的一天 (或者第一次打开)
    if (lastCheckDate !== today) {
        // 定义一周的食物，你可以随便增删
        const weeklyFoods = [
            { name: '蛋糕', src: 'https://twemoji.maxcdn.com/v/latest/72x72/1f370.png' },
            { name: '汉堡', src: 'https://twemoji.maxcdn.com/v/latest/72x72/1f354.png' },
            { name: '草莓', src: 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png' },
            { name: '西瓜', src: 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png' },
            { name: '牛角包', src: 'https://twemoji.maxcdn.com/v/latest/72x72/1f950.png' },
            { name: '饭团', src: 'https://twemoji.maxcdn.com/v/latest/72x72/1f359.png' },
            { name: '牛奶', src: 'https://twemoji.maxcdn.com/v/latest/72x72/1f95b.png' }
        ];
        
        // 随机选一个
        const randomFood = weeklyFoods[Math.floor(Math.random() * weeklyFoods.length)];

        // 保存今天的食物和“已检查”的日期
        localStorage.setItem('todayFood', JSON.stringify(randomFood));
        localStorage.setItem('lastCheckDate', today);
    }

    // 无论是不是新的一天，都尝试显示今天的食物
    const todayFoodData = localStorage.getItem('todayFood');
    if (todayFoodData) {
        const food = JSON.parse(todayFoodData);
        const foodImg = document.createElement('img');
        foodImg.src = food.src;
        foodImg.alt = food.name;
        foodImg.className = 'inventory-icon food-emoji-source';
        // 防止重复添加
        if (!dailyFoodContainer.querySelector(`img[alt="${food.name}"]`)) {
             dailyFoodContainer.appendChild(foodImg);
        }
    }
}
    // 目标1：修复图片切换逻辑
    if (isFireLit && isChairPlaced) {
        tentBackground.src = 'images/tent-fire-chair.png';
    } else if (isFireLit) {
        tentBackground.src = 'images/tent-light-bg.png';
    } else if (isChairPlaced) {
        tentBackground.src = 'images/tent-dark-chair.png';
    } else {
        tentBackground.src = 'images/tent-dark-bg.png';
    }
    
    // 目标2：木柴图标永不消失 (不再控制 woodItem 的显示)
    chairItem.style.display = isChairPlaced ? 'none' : 'block';
    
    if (isFireLit) {
        fireLoopSound.volume = 0.3;
        fireLoopSound.play();
    } else {
        fireLoopSound.pause();
    }
}

// 唯一的、正确的 woodItem 点击事件 (目标2：实现无限点击)
woodItem.addEventListener('click', () => {
    // --- 新增：百度统计事件跟踪 ---
    _hmt.push(['_trackEvent', 'p3_tent_interaction', 'click', 'use_wood']);
    isFireLit = true; 
    localStorage.setItem('isFireLit', 'true');
    fireStartSound.currentTime = 0;
    fireStartSound.play();
    updateTentVisuals();
});

// 唯一的、正确的 chairItem 点击事件
chairItem.addEventListener('click', () => {
    if (!isChairPlaced) {
        isChairPlaced = true;
        localStorage.setItem('isChairPlaced', 'true');
        updateTentVisuals();
    }
});

// 唯一的、正确的 Tab 切换逻辑
const tabEquipment = document.getElementById('tab-equipment');
const tabFood = document.getElementById('tab-food');
if(tabEquipment && tabFood){
     const inventoryEquipment = document.getElementById('inventory-equipment');
     tabEquipment.addEventListener('click', () => { 
         tabEquipment.classList.add('active'); 
         tabFood.classList.remove('active'); 
         inventoryEquipment.classList.add('visible'); 
         inventoryFood.classList.remove('visible'); 
     });
     tabFood.addEventListener('click', () => { 
         tabFood.classList.add('active'); 
         tabEquipment.classList.remove('active'); 
         inventoryFood.classList.add('visible'); 
         inventoryEquipment.classList.remove('visible'); 
     });
}

// 唯一的、正确的 chatLink 点击事件
chatLink.addEventListener('click', () => {
    localStorage.setItem('isFireLit', isFireLit);
    localStorage.setItem('isChairPlaced', isChairPlaced);
});

// 初始化
updateTentVisuals();
}
// --- Page 4 Logic: New Chat UI (Final, Final, Final Logic v3) ---
const chatMessagesContainer = document.getElementById('chat-messages-p4');
if (chatMessagesContainer) {
    if (localStorage.getItem('isFireLit') === 'true') { const fireLoopSound = document.getElementById('fire-loop-sound'); if (fireLoopSound) { fireLoopSound.volume = 0.3; fireLoopSound.play(); } }
    const chatInput = document.getElementById('chat-input-p4'), sendButton = document.getElementById('send-button-p4');
    const messageMenu = document.getElementById('message-menu'), commentInput = document.getElementById('comment-input'), commentSubmitBtn = document.getElementById('comment-submit-btn');
    let activeMessageIndex = null;
    let chatHistory = JSON.parse(localStorage.getItem('chatHistoryP4')) || [];

    function addMessageToScreen(message, index) {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble-p4 ${message.type === 'my' ? 'my-message-p4' : 'other-message-p4'}`;
        if (message.text.includes('<img')) { bubble.innerHTML = message.text; } else { bubble.textContent = message.text; }
        if (message.reactions && message.reactions.length > 0) { const reactionsDiv = document.createElement('div'); reactionsDiv.className = 'reactions'; reactionsDiv.textContent = message.reactions.join(' '); bubble.appendChild(reactionsDiv); }
        if (message.comments && message.comments.length > 0) { message.comments.forEach(comment => { const commentDiv = document.createElement('div'); commentDiv.className = 'comment-display'; commentDiv.innerHTML = `${comment.text}<span class="comment-timestamp">${comment.timestamp}</span>`; bubble.appendChild(commentDiv); }); }
        let pressTimer;
        bubble.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { activeMessageIndex = index; messageMenu.classList.add('visible'); }, 800); });
        bubble.addEventListener('touchend', () => clearTimeout(pressTimer));
        bubble.addEventListener('touchmove', () => clearTimeout(pressTimer));
        bubble.addEventListener('contextmenu', (e) => { e.preventDefault(); activeMessageIndex = index; messageMenu.classList.add('visible'); });
        chatMessagesContainer.appendChild(bubble);
    }
    
    function renderChat(shouldScrollToBottom = true) {
        const lastScrollTop = chatMessagesContainer.scrollTop;
        chatMessagesContainer.innerHTML = '';
        let lastDate = null;
        let lastMessageTimestamp = 0;
        const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

        chatHistory.forEach((message, index) => {
            if (message.date && message.date !== lastDate) {
                const dateSeparator = document.createElement('div');
                dateSeparator.className = 'date-separator';
                dateSeparator.textContent = message.date;
                chatMessagesContainer.appendChild(dateSeparator);
            }
            const currentMessageTimestamp = message.timestamp || 0;
            if (currentMessageTimestamp - lastMessageTimestamp > TEN_MINUTES_IN_MS) {
                if (message.time) {
                    const timeSeparator = document.createElement('div');
                    timeSeparator.className = 'date-separator';
                    timeSeparator.textContent = message.time;
                    chatMessagesContainer.appendChild(timeSeparator);
                }
            }
            addMessageToScreen(message, index);
            lastMessageTimestamp = currentMessageTimestamp;
            lastDate = message.date;
        });

        if (shouldScrollToBottom) {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        } else {
            chatMessagesContainer.scrollTop = lastScrollTop;
        }
    }

    function sendMessage() {
        _hmt.push(['_trackEvent', 'p4_chat', 'click', 'send_message']);
        const text = chatInput.value.trim();
        if (text === '') return;
        const now = new Date();
        const newMessage = { type: 'my', text: text, date: now.toLocaleDateString(), time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`, timestamp: now.getTime() };
        chatHistory.push(newMessage);
        localStorage.setItem('chatHistoryP4', JSON.stringify(chatHistory));
        renderChat(true);
        chatInput.value = '';
    }

    function initializeChat() {
        if (chatHistory.length === 0) {
            const now = new Date();
            const welcomeMessage = { type: 'other', text: '你好！这里是你的私人帐蓬，你可以说任何你想说的话，这里没有ai评判你。你可以自己和自己说的话互动（也可以手动打字加时间戳），手机长按气泡（电脑端的话右键）可以出现一个菜单，你可以喜欢自己发的话，也可以质疑这句话是否夸大了困难，也可以觉得它很好玩。你还可以累计评论你之前说的话！然后在一天结束的时候复盘自己的精力损耗，来更好理解自己，更好调节心态。所有信息都本地存储！have fun!', date: now.toLocaleDateString(), time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`, timestamp: now.getTime() };
            chatHistory.push(welcomeMessage);
            localStorage.setItem('chatHistoryP4', JSON.stringify(chatHistory));
        }
        renderChat(true);
    }

    sendButton.addEventListener('mousedown', (e) => e.preventDefault());
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
    messageMenu.addEventListener('click', (event) => {
        const target = event.target; const action = target.dataset.action;
        if (!action || activeMessageIndex === null) return;
        const message = chatHistory[activeMessageIndex];
        if (!message.reactions) message.reactions = [];
        if (action === 'like' && !message.reactions.includes('❤️')) message.reactions.push('❤️');
        if (action === 'challenge' && !message.reactions.includes('❓')) message.reactions.push('❓');
        if (action === 'laugh' && !message.reactions.includes('😂')) message.reactions.push('😂');
        if (action === 'delete') { chatHistory.splice(activeMessageIndex, 1); }
        localStorage.setItem('chatHistoryP4', JSON.stringify(chatHistory));
        renderChat(false);
        messageMenu.classList.remove('visible'); activeMessageIndex = null;
    });
    commentSubmitBtn.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (text === '' || activeMessageIndex === null) return;
        const message = chatHistory[activeMessageIndex];
        if (!message.comments) message.comments = [];
        message.comments.push({ text: text, timestamp: new Date().toLocaleString() });
        localStorage.setItem('chatHistoryP4', JSON.stringify(chatHistory));
        renderChat(false);
        messageMenu.classList.remove('visible'); commentInput.value = ''; activeMessageIndex = null;
    });

    initializeChat();
    const p4BackArrow = document.querySelector('.chat-header-p4 a[href="page3.html"]');
if (p4BackArrow) {
    p4BackArrow.addEventListener('click', function(event) {
        // 1. 阻止它默认跳转到 page3.html
        event.preventDefault();
        
        // 2. 命令浏览器历史记录后退一步
        window.history.back();
    });
}
}    

    // --- Page 5 Logic: Task List Management (The complete, correct version) ---
    // --- Page 5 Logic: Task List Management ---
// 新增：获取Page 5的音效元素
    const checkboxSound = document.getElementById('checkbox-sound');
    const addTaskSound = document.getElementById('add-task-sound');


    const taskContainer = document.getElementById('task-container');
    if (taskContainer) {
        const completeTaskBtn = document.getElementById('complete-task-btn');
        let tasks = JSON.parse(localStorage.getItem('nextStepTasks')) || [];

        function renderTasks() {
            taskContainer.innerHTML = '';
            let hasIncompleteTask = false;
            // --- 核心修复：在这里初始化任务数组 ---
            if (tasks.length === 0) {
                tasks.push({ text: '', isCompleted: false, isChecked: false });
            }


            tasks.forEach((task, index) => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                // 如果任务是“已完成”或者“已被勾选”，都让复选框显示为打勾状态
                checkbox.checked = task.isCompleted || task.isChecked;
                checkbox.disabled = true;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = task.text;
                input.disabled = task.isCompleted;

                if (task.isCompleted) {
                    input.classList.add('task-completed');
                } else {
                    hasIncompleteTask = true;
                    checkbox.disabled = false; // 1. 解除禁用，让它可以被点击
                checkbox.addEventListener('click', () => {
                        // --- 新增：在这里播放打勾音效 ---
                        if (checkboxSound) {
                        checkboxSound.currentTime = 0;
                        checkboxSound.play();
                }
    // --- 核心修复：把勾选状态保存到任务对象中 ---
    // 1. 我们给 task 对象创建一个新的属性 isChecked 来记录勾选状态
    tasks[index].isChecked = checkbox.checked;
    
    // 2. 保存整个更新后的任务列表到 localStorage
    localStorage.setItem('nextStepTasks', JSON.stringify(tasks));
});
                    input.addEventListener('input', () => {
                        tasks[index].text = input.value;
                        localStorage.setItem('nextStepTasks', JSON.stringify(tasks));
                    });
                    // --- 新增：在这里加上监听回-车键的功能 ---
input.addEventListener('keypress', function(event) {
    // 检查按下的键是否是 "Enter"
    if (event.key === 'Enter') {
        // 阻止回车键的默认行为 (比如在表单中提交)
        event.preventDefault();
        
        // 手动触发“完成！+ 添加新行动”按钮的点击事件
        completeTaskBtn.click();
    }
});
                }
                taskItem.appendChild(checkbox);
                taskItem.appendChild(input);
                taskContainer.appendChild(taskItem);
            });

            if (!hasIncompleteTask) {
                const newTaskItem = document.createElement('div');
                newTaskItem.className = 'task-item';
                const newCheckbox = document.createElement('input');
                newCheckbox.type = 'checkbox';
                const newInput = document.createElement('input');
                newInput.type = 'text';
                newInput.placeholder = '新的最小行动...';

                newInput.addEventListener('input', () => {
                    const latestTask = tasks[tasks.length - 1];
                    if (!latestTask || latestTask.isCompleted) {
                        tasks.push({ text: newInput.value, isCompleted: false });
                    } else {
                        latestTask.text = newInput.value;
                    }
                    localStorage.setItem('nextStepTasks', JSON.stringify(tasks));
                });
                newTaskItem.appendChild(newCheckbox);
                newTaskItem.appendChild(newInput);
                taskContainer.appendChild(newTaskItem);
            }
        }

        // “完成！+ 添加新行动”按钮的逻辑 (已加入自动滚动)
completeTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();
      // --- 新增：百度统计事件跟踪 ---
    _hmt.push(['_trackEvent', 'p5_tasks', 'click', 'add_new_action']);
    
    const currentTask = tasks.find(task => !task.isCompleted);
    // --- 新增：在这里播放添加新任务的音效 ---
        if (addTaskSound) {
            addTaskSound.currentTime = 0;
            addTaskSound.play();
        }
    
    if (currentTask && currentTask.text.trim() !== '') {
        currentTask.isCompleted = true;
        tasks.push({ text: '', isCompleted: false, isChecked: false });
        localStorage.setItem('nextStepTasks', JSON.stringify(tasks));
        renderTasks();
        

        // --- 核心魔法：让内容容器滚动到底部 ---
        const contentWrapper = document.querySelector('.page5-content');
        if (contentWrapper) {
            // 使用平滑滚动效果
            contentWrapper.scrollTo({
                top: contentWrapper.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
});
        
        renderTasks();
    }
// --- 新增：Page 5 通用返回按钮逻辑 ---
const backToPreviousBtn = document.getElementById('back-to-previous-btn');
if (backToPreviousBtn) {
    backToPreviousBtn.addEventListener('click', function(event) {
        // 1. 阻止链接的默认跳转行为
        event.preventDefault();
        
        // 2. 命令浏览器历史记录后退一步
        window.history.back();
    });
    // --- 新增：Page 5 全部重置按钮逻辑 ---
const clearTasksBtn = document.getElementById('clear-tasks-btn');
if (clearTasksBtn) {
    clearTasksBtn.addEventListener('click', function(event) {
        // 1. 阻止链接的默认跳转行为
        event.preventDefault();
        tasks = []; // 1. 直接清空内存中的任务数组
        
        localStorage.setItem('nextStepTasks', JSON.stringify(tasks)); // 2. 把空数组存回去
        
        // 3. 刷新页面，JS因为找不到记录，会自动回到初始状态
        window.location.reload();
    });
}
}});