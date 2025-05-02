// تهيئة قاعدة بيانات محلية باستخدام localStorage
function initDatabase() {
  // إنشاء المستخدمين الافتراضيين إذا لم تكن موجودة
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      { username: 'admin', password: 'admin123', email: 'admin@gharib.com', fullname: 'مدير النظام', isAdmin: true },
      { username: 'user1', password: 'user123', email: 'user1@gharib.com', fullname: 'مستخدم تجريبي', isAdmin: false }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
  
  // إنشاء محادثات افتراضية إذا لم تكن موجودة
  if (!localStorage.getItem('chats')) {
    const defaultChats = [];
    localStorage.setItem('chats', JSON.stringify(defaultChats));
  }
}

// تسجيل الدخول
function login(username, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }
  return false;
}

// تسجيل خروج
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// إنشاء حساب جديد
function signup(fullname, username, email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // التحقق من عدم وجود اسم مستخدم مكرر
  if (users.some(u => u.username === username)) {
    return { success: false, message: 'اسم المستخدم موجود بالفعل' };
  }
  
  // إضافة مستخدم جديد
  const newUser = {
    fullname,
    username,
    email,
    password,
    isAdmin: false
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true, message: 'تم إنشاء الحساب بنجاح' };
}

// إرسال رسالة جديدة في المحادثة
function sendChatMessage(message) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'زائر' };
  const chats = JSON.parse(localStorage.getItem('chats')) || [];
  
  const newMessage = {
    sender: currentUser.username,
    text: message,
    timestamp: new Date().toISOString()
  };
  
  chats.push(newMessage);
  localStorage.setItem('chats', JSON.stringify(chats));
  return newMessage;
}

// الحصول على جميع الرسائل
function getAllMessages() {
  return JSON.parse(localStorage.getItem('chats')) || [];
}

// الحصول على جميع المستخدمين (للمدير فقط)
function getAllUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

// التحقق من المستخدم الحالي
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser')) || null;
}

// إرسال نموذج الاتصال
function submitContactForm(name, email, message) {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  const newContact = {
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };
  
  contacts.push(newContact);
  localStorage.setItem('contacts', JSON.stringify(contacts));
  return { success: true, message: 'تم إرسال رسالتك بنجاح' };
}

// معالجة نماذج التسجيل والمصادقة
document.addEventListener('DOMContentLoaded', function() {
  // تهيئة قاعدة البيانات
  initDatabase();
  
  // فحص إذا كان المستخدم الحالي مسجل الدخول
  const currentUser = getCurrentUser();
  
  // معالجة نموذج تسجيل الدخول
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (login(username, password)) {
        const user = getCurrentUser();
        if (user.isAdmin) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'chat.html';
        }
      } else {
        alert('خطأ في اسم المستخدم أو كلمة المرور');
      }
    });
  }
  
  // معالجة نموذج إنشاء حساب جديد
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const fullname = document.getElementById('fullname').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const result = signup(fullname, username, email, password);
      if (result.success) {
        alert(result.message);
        window.location.href = 'login.html';
      } else {
        alert(result.message);
      }
    });
  }
  
  // معالجة نموذج الاتصال
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      const result = submitContactForm(name, email, message);
      if (result.success) {
        alert(result.message);
        contactForm.reset();
      }
    });
  }
  
  // معالجة أزرار لوحة التحكم للمدير
  const adminContainer = document.querySelector('.admin-container');
  if (adminContainer) {
    // التحقق من أن المستخدم مدير
    if (!currentUser || !currentUser.isAdmin) {
      window.location.href = 'login.html';
    }
    
    const manageBtn = document.querySelector('.manage-btn');
    if (manageBtn) {
      manageBtn.addEventListener('click', function() {
        showUserManagement();
      });
    }
    
    const statsBtn = document.querySelector('.stats-btn');
    if (statsBtn) {
      statsBtn.addEventListener('click', function() {
        showChatStatistics();
      });
    }
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        logout();
      });
    }
  }
  
  // تهيئة صفحة الدردشة
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    // عرض الرسائل السابقة
    loadChatMessages();
    
    // معالجة إرسال الرسائل
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
      messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
    }
  }
  
  // إزالة التنبيه في الصفحة الرئيسية بعد التحميل الأول
  const indexPage = document.querySelector('h1');
  if (indexPage && indexPage.textContent.includes('مرحباً بك في تطبيق الغريب')) {
    // إذا كان المستخدم قد زار الموقع من قبل، نزيل التنبيه
    if (localStorage.getItem('visited')) {
      // إزالة التنبيه من النص
      const script = document.querySelector('script');
      if (script && script.textContent.includes('alert')) {
        script.textContent = '// تم إزالة التنبيه بعد الزيارة الأولى';
      }
    } else {
      localStorage.setItem('visited', 'true');
    }
  }
});

// وظائف إضافية للدردشة
function loadChatMessages() {
  const messages = getAllMessages();
  const messagesDiv = document.getElementById('messages');
  if (!messagesDiv) return;
  
  messagesDiv.innerHTML = '';
  const currentUser = getCurrentUser();
  
  messages.forEach(msg => {
    const isMine = currentUser && msg.sender === currentUser.username;
    const messageClass = isMine ? 'sent' : 'received';
    
    messagesDiv.innerHTML += `
      <div class="message ${messageClass}">
        <strong>${msg.sender}:</strong>
        <p>${msg.text}</p>
        <small>${new Date(msg.timestamp).toLocaleString('ar-SA')}</small>
      </div>
      <div style="clear: both;"></div>
    `;
  });
  
  // التمرير لأسفل لآخر رسالة
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// وظيفة إرسال رسالة جديدة
function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (message) {
    const newMessage = sendChatMessage(message);
    input.value = '';
    loadChatMessages();
    
    // محاكاة رد تلقائي بعد ثانيتين
    setTimeout(() => {
      sendChatMessage(`رد آلي: استلمنا رسالتك "${message}"`);
      loadChatMessages();
    }, 2000);
  }
}

// وظائف لوحة التحكم للمدير
function showUserManagement() {
  const adminContainer = document.querySelector('.admin-container');
  if (!adminContainer) return;
  
  const users = getAllUsers();
  
  let usersHTML = '<div class="user-management"><h2>إدارة المستخدمين</h2><table border="1" style="width:100%; border-collapse:collapse;">';
  usersHTML += '<tr><th>الاسم الكامل</th><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>نوع الحساب</th></tr>';
  
  users.forEach(user => {
    usersHTML += `<tr>
      <td>${user.fullname}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.isAdmin ? 'مدير' : 'مستخدم عادي'}</td>
    </tr>`;
  });
  
  usersHTML += '</table></div>';
  
  // إضافة العنصر بعد العناصر الموجودة
  const existingManagement = document.querySelector('.user-management');
  if (existingManagement) {
    existingManagement.outerHTML = usersHTML;
  } else {
    adminContainer.insertAdjacentHTML('beforeend', usersHTML);
  }
}

function showChatStatistics() {
  const adminContainer = document.querySelector('.admin-container');
  if (!adminContainer) return;
  
  const messages = getAllMessages();
  
  // تجميع الرسائل حسب المستخدم
  const userStats = {};
  messages.forEach(msg => {
    if (!userStats[msg.sender]) {
      userStats[msg.sender] = 0;
    }
    userStats[msg.sender]++;
  });
  
  let statsHTML = '<div class="chat-statistics"><h2>إحصائيات المحادثات</h2>';
  statsHTML += '<p>إجمالي عدد الرسائل: ' + messages.length + '</p>';
  statsHTML += '<table border="1" style="width:100%; border-collapse:collapse;">';
  statsHTML += '<tr><th>المستخدم</th><th>عدد الرسائل</th></tr>';
  
  for (const user in userStats) {
    statsHTML += `<tr><td>${user}</td><td>${userStats[user]}</td></tr>`;
  }
  
  statsHTML += '</table></div>';
  
  // إضافة العنصر بعد العناصر الموجودة
  const existingStats = document.querySelector('.chat-statistics');
  if (existingStats) {
    existingStats.outerHTML = statsHTML;
  } else {
    adminContainer.insertAdjacentHTML('beforeend', statsHTML);
  }
}