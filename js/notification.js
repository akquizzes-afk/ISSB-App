// notification.js - Comprehensive Notification System with Debug Logging

// Constants
const NOTIFICATION_SCHEDULE_KEY = 'ghani_notification_schedule';

// 1. Capture Global Errors (Crashes)
window.onerror = function(msg, url, line, col, error) {
    const log = `❌ ERROR: ${msg}\nLine: ${line}`;
    debugError(log);
    return false;
};

// 2. Capture Standard Console Logs
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    if (!message.includes('NOTIFICATION DEBUG')) {
         const debugEl = document.getElementById('notificationDebug');
         if (debugEl) {
            const timestamp = new Date().toLocaleTimeString();
            debugEl.innerHTML += `<div style="color: #fff; border-bottom: 1px solid #333;">[${timestamp}] ${message}</div>`;
         }
    }
};

// Global debug state
window.NOTIFICATION_DEBUG = true;

function debugLog(message, data = null) {
    if (window.NOTIFICATION_DEBUG) {
        console.log(`🔔 NOTIFICATION DEBUG: ${message}`, data || '');
        const debugEl = document.getElementById('notificationDebug');
        if (debugEl) {
            const timestamp = new Date().toLocaleTimeString();
            debugEl.innerHTML += `<div style="color: #10b981; font-size: 12px; margin: 2px 0;">[${timestamp}] ${message}</div>`;
            debugEl.scrollTop = debugEl.scrollHeight;
        }
    }
}

function debugError(message, error = null) {
    if (window.NOTIFICATION_DEBUG) {
        console.error(`🔔 NOTIFICATION ERROR: ${message}`, error || '');
        const debugEl = document.getElementById('notificationDebug');
        if (debugEl) {
            const timestamp = new Date().toLocaleTimeString();
            debugEl.innerHTML += `<div style="color: #ef4444; font-size: 12px; margin: 2px 0;">[${timestamp}] ERROR: ${message}</div>`;
            debugEl.scrollTop = debugEl.scrollHeight;
        }
    }
}

function saveScheduleToStorage(hour, minute, period, dayCheckboxes) {
    try {
        const scheduleData = {
            hour: hour,
            minute: minute,
            period: period,
            days: Array.from(dayCheckboxes).map(checkbox => checkbox.value),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(NOTIFICATION_SCHEDULE_KEY, JSON.stringify(scheduleData));
        debugLog('Schedule saved to localStorage', scheduleData);
        return true;
    } catch (error) {
        debugError('Failed to save schedule to storage', error);
        return false;
    }
}

function loadScheduleFromStorage() {
    try {
        const savedSchedule = localStorage.getItem(NOTIFICATION_SCHEDULE_KEY);
        if (savedSchedule) {
            const schedule = JSON.parse(savedSchedule);
            if (schedule.hour) document.getElementById('notify-hour').value = schedule.hour;
            if (schedule.minute) document.getElementById('notify-minute').value = schedule.minute;
            if (schedule.period) document.getElementById('notify-period').value = schedule.period;
            if (schedule.days && schedule.days.length > 0) {
                const allDayCheckboxes = document.querySelectorAll('.day-checkbox');
                allDayCheckboxes.forEach(checkbox => {
                    checkbox.checked = schedule.days.includes(checkbox.value);
                });
            }
            debugLog('Loaded schedule from storage', schedule);
            return true;
        }
        return false;
    } catch (error) {
        debugError('Error loading schedule', error);
        return false;
    }
}

function checkCapacitorAvailability() {
    const capacitorAvailable = !!window.Capacitor;
    const notificationsAvailable = !!(window.Capacitor?.Plugins?.LocalNotifications);
    return { capacitorAvailable, notificationsAvailable };
}

async function initializeNotifications() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return false;

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        await LocalNotifications.createChannel({
            id: 'reminder_channel',
            name: 'Daily Reminders',
            description: 'Reminders to take your test',
            importance: 5,
            visibility: 1,
            vibration: true
        });
        return true;
    } catch (error) {
        debugError('Failed to create channel', error);
        return false;
    }
}

async function initializeNotificationSystem() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return false;

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        await LocalNotifications.registerActionTypes({
            types: [{
                id: 'TAKE_TEST_ACTION',
                actions: [
                    { id: 'start', title: 'Start Test', foreground: true },
                    { id: 'dismiss', title: 'Dismiss', destructive: true }
                ]
            }]
        });

        LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
            if (action.actionId === 'start') {
                window.location.href = 'wat-test.html';
            }
        });
        return true;
    } catch (error) {
        debugError('Error initializing system', error);
        return false;
    }
}

async function checkAndRequestPermissions() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return { granted: false };

    const { LocalNotifications } = window.Capacitor.Plugins;
    try {
        let permission = await LocalNotifications.checkPermissions();
        if (permission.display !== 'granted') {
            permission = await LocalNotifications.requestPermissions();
        }
        return { granted: permission.display === 'granted', permission: permission };
    } catch (error) {
        debugError('Error requesting permissions', error);
        return { granted: false, error: error };
    }
}

async function getPendingNotifications() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return { count: 0, notifications: [] };

    const { LocalNotifications } = window.Capacitor.Plugins;
    try {
        const pending = await LocalNotifications.getPending();
        return pending;
    } catch (error) {
        return { count: 0, notifications: [], error: error };
    }
}

async function clearAllNotifications() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return false;

    const { LocalNotifications } = window.Capacitor.Plugins;
    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel(pending);
        }
        return true;
    } catch (error) {
        return false;
    }
}

function convertTo24Hour(hour, minute, period) {
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    else if (period === 'AM' && hour24 === 12) hour24 = 0;
    return { hour: hour24, minute: parseInt(minute) };
}

function getNextWeekday(dayOfWeek, hour, minute) {
    const now = new Date();
    const result = new Date();
    result.setHours(hour, minute, 0, 0);
    
    let daysUntilNext = dayOfWeek - now.getDay();
    if (daysUntilNext < 0 || (daysUntilNext === 0 && result <= now)) {
        daysUntilNext += 7;
    }
    result.setDate(now.getDate() + daysUntilNext);
    
    // If result is in the past (safety check), add a week
    if (result < now) {
        result.setDate(result.getDate() + 7);
    }
    
    return result;
}

async function saveNotificationSchedule() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) {
        alert('Notifications not supported');
        return false;
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        const permissionResult = await checkAndRequestPermissions();
        if (!permissionResult.granted) {
            alert('Please enable notifications in settings.');
            return false;
        }

        await clearAllNotifications();

        const hour = document.getElementById('notify-hour').value;
        const minute = document.getElementById('notify-minute').value;
        const period = document.getElementById('notify-period').value;
        const { hour: hour24, minute: minute24 } = convertTo24Hour(hour, minute, period);
        
        const dayCheckboxes = document.querySelectorAll('.day-checkbox:checked');
        
        if (dayCheckboxes.length === 0) {
            alert('Please select at least one day');
            return false;
        }

        const notificationsToSchedule = [];

        dayCheckboxes.forEach(checkbox => {
            const dayOfWeek = parseInt(checkbox.value);
            const nextDate = getNextWeekday(dayOfWeek, hour24, minute24);
            
            notificationsToSchedule.push({
                id: dayOfWeek + 100,
                title: "🧠 It's Test Time!",
                body: "Your daily reminder to take a psychological test.",
                channelId: 'reminder_channel',
                // 🔥 FIXED: Use bare filename, no 'res://' schema
                smallIcon: 'ic_launcher', 
                // 🔥 FIXED: Explicit color often helps on modern Android
                iconColor: '#10b981',
                actionTypeId: 'TAKE_TEST_ACTION',
                schedule: {
                    at: nextDate,
                    repeats: true,
                    every: 'week',
                    allowWhileIdle: true
                }
            });
        });

        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        saveScheduleToStorage(hour, minute, period, dayCheckboxes);
        
        const notificationStatus = document.getElementById('notificationStatus');
        if (notificationStatus) {
            notificationStatus.innerHTML = `<i class="fas fa-check-circle"></i> Scheduled!`;
            notificationStatus.classList.remove('hidden');
        }
        
        return true;

    } catch (error) {
        debugError('Scheduling failed', error);
        alert('Error setting up notifications.');
        return false;
    }
}

async function testNotification() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return;

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        await LocalNotifications.schedule({
            notifications: [{
                id: 999,
                title: "🧠 Test Notification!",
                body: "This is a test!",
                channelId: 'reminder_channel',
                // 🔥 FIXED: Use bare filename
                smallIcon: 'ic_launcher',
                iconColor: '#10b981',
                schedule: { at: new Date(Date.now() + 3000) }
            }]
        });
        alert('Notification in 3 seconds...');
    } catch (error) {
        debugError('Test failed', error);
    }
}

// Make functions globally available
window.notificationSystem = {
    initializeCompleteNotificationSystem: async () => {
        const results = { systemInitialized: false };
        try {
            await initializeNotifications();
            await initializeNotificationSystem();
            await checkAndRequestPermissions();
            // Note: We don't auto-schedule here to avoid "Random" loops
            return results;
        } catch(e) { return results; }
    },
    saveNotificationSchedule,
    testNotification,
    loadScheduleFromStorage
};