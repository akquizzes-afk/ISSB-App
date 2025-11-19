// notification.js - Robust Notification System with Debugging

// Constants
const NOTIFICATION_SCHEDULE_KEY = 'ghani_notification_schedule';

// --- 1. DEBUGGING TOOLS ---

// Global debug state
window.NOTIFICATION_DEBUG = true;

function debugLog(message, data = null) {
    // Print to browser console
    if (data) console.log(`🔔 [DEBUG] ${message}`, data);
    else console.log(`🔔 [DEBUG] ${message}`);

    // Print to your HTML Debug Panel
    const debugEl = document.getElementById('notificationDebug');
    if (debugEl) {
        const time = new Date().toLocaleTimeString().split(' ')[0];
        // Check if data is an object to format it nicely
        const dataString = data ? ` <span style="color:#fbbf24">${typeof data === 'object' ? JSON.stringify(data) : data}</span>` : '';
        
        const logEntry = document.createElement('div');
        logEntry.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        logEntry.style.padding = "2px 0";
        logEntry.innerHTML = `<span style="color:#94a3b8">[${time}]</span> ${message}${dataString}`;
        
        debugEl.appendChild(logEntry);
        debugEl.scrollTop = debugEl.scrollHeight;
    }
}

function debugError(message, error = null) {
    console.error(`❌ [ERROR] ${message}`, error);
    
    const debugEl = document.getElementById('notificationDebug');
    if (debugEl) {
        const time = new Date().toLocaleTimeString();
        const errString = error ? ` <span style="color:#f87171">${JSON.stringify(error.message || error)}</span>` : '';
        
        debugEl.innerHTML += `<div style="color:#ef4444; border-bottom:1px solid rgba(255,0,0,0.2);">[${time}] ❌ ${message}${errString}</div>`;
        debugEl.scrollTop = debugEl.scrollHeight;
    }
}

// --- 2. STORAGE MANAGEMENT ---

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
        debugLog('💾 Schedule saved to memory');
        return true;
    } catch (error) {
        debugError('Failed to save to local storage', error);
        return false;
    }
}

function loadScheduleFromStorage() {
    try {
        const savedSchedule = localStorage.getItem(NOTIFICATION_SCHEDULE_KEY);
        if (savedSchedule) {
            const schedule = JSON.parse(savedSchedule);
            
            // Restore UI elements
            if (schedule.hour) document.getElementById('notify-hour').value = schedule.hour;
            if (schedule.minute) document.getElementById('notify-minute').value = schedule.minute;
            if (schedule.period) document.getElementById('notify-period').value = schedule.period;
            
            if (schedule.days) {
                const allDayCheckboxes = document.querySelectorAll('.day-checkbox');
                allDayCheckboxes.forEach(checkbox => {
                    checkbox.checked = schedule.days.includes(checkbox.value);
                });
            }
            debugLog('📂 Loaded saved preferences');
            return true;
        }
        return false;
    } catch (error) {
        debugError('Error loading storage', error);
        return false;
    }
}

// --- 3. CAPACITOR HELPERS ---

function checkCapacitorAvailability() {
    const capacitorAvailable = !!window.Capacitor;
    const notificationsAvailable = !!(window.Capacitor?.Plugins?.LocalNotifications);
    
    if (!notificationsAvailable) {
        debugLog("⚠️ Capacitor LocalNotifications plugin missing");
    }
    return { capacitorAvailable, notificationsAvailable };
}

// --- 4. CORE NOTIFICATION LOGIC ---

async function initializeNotifications() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return false;

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        // Create a High Importance Channel
        await LocalNotifications.createChannel({
            id: 'reminder_channel',
            name: 'Daily Reminders',
            description: 'Reminders to take your test',
            importance: 5, // MAX Importance (Heads up)
            visibility: 1, // Public on lock screen
            vibration: true,
            sound: 'default' // Explicitly set sound
        });
        debugLog('✅ Notification Channel Created');
        return true;
    } catch (error) {
        debugError('Channel creation failed', error);
        return false;
    }
}

async function checkAndRequestPermissions() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return { granted: false };

    const { LocalNotifications } = window.Capacitor.Plugins;
    try {
        let permission = await LocalNotifications.checkPermissions();
        debugLog(`Permission Status: ${permission.display}`);

        if (permission.display !== 'granted') {
            debugLog('Requesting permissions...');
            permission = await LocalNotifications.requestPermissions();
        }
        return { granted: permission.display === 'granted' };
    } catch (error) {
        debugError('Permission request error', error);
        return { granted: false };
    }
}

async function clearAllNotifications() {
    const { LocalNotifications } = window.Capacitor.Plugins;
    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            debugLog(`🗑️ Found ${pending.notifications.length} pending alarms. Clearing...`);
            await LocalNotifications.cancel(pending);
            debugLog('✅ All old alarms cancelled');
        } else {
            debugLog('ℹ️ No previous alarms to clear');
        }
        return true;
    } catch (error) {
        debugError('Clear failed', error);
        return false;
    }
}

// Helper: Time Calculation
function convertTo24Hour(hour, minute, period) {
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    else if (period === 'AM' && hour24 === 12) hour24 = 0;
    return { hour: hour24, minute: parseInt(minute) };
}

function getNextWeekday(dayOfWeek, hour, minute) {
    const now = new Date();
    const result = new Date();
    
    // Set the target time for TODAY
    result.setHours(hour, minute, 0, 0);
    
    // Calculate day difference
    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    let currentDay = now.getDay();
    let diff = dayOfWeek - currentDay;
    
    // If the day is in the past (e.g., today is Wed, user wants Mon) -> Add 7 days
    // OR if it's Today, but the time has already passed -> Add 7 days
    if (diff < 0 || (diff === 0 && result <= now)) {
        diff += 7;
    }
    
    // Add the days to the date object
    result.setDate(now.getDate() + diff);
    
    return result;
}

// --- 5. MAIN SCHEDULE FUNCTION ---

async function saveNotificationSchedule() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) {
        alert('Notifications not supported on this device');
        return false;
    }
    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        debugLog('🚀 Starting schedule sequence...');

        // 1. Check Permissions
        const permissionResult = await checkAndRequestPermissions();
        if (!permissionResult.granted) {
            alert('Permission denied. We cannot send reminders.');
            return false;
        }

        // 2. Clear Old Alarms (Critical step to prevent duplicates)
        await clearAllNotifications();

        // 3. Get User Input
        const hour = document.getElementById('notify-hour').value;
        const minute = document.getElementById('notify-minute').value;
        const period = document.getElementById('notify-period').value;
        const dayCheckboxes = document.querySelectorAll('.day-checkbox:checked');
        
        if (dayCheckboxes.length === 0) {
            alert('Please select at least one day');
            return false;
        }

        // 4. Calculate & Build Schedule
        const { hour: hour24, minute: minute24 } = convertTo24Hour(hour, minute, period);
        const notificationsToSchedule = [];

        debugLog(`📅 Preparing schedule for ${hour}:${minute} ${period}`);

        dayCheckboxes.forEach(checkbox => {
            const targetDay = parseInt(checkbox.value);
            const scheduleDate = getNextWeekday(targetDay, hour24, minute24);
            
            // Create unique ID based on Day (0-6). 
            // Monday (1) becomes ID 101. Tuesday (2) becomes ID 102.
            const uniqueId = 100 + targetDay;

            debugLog(`👉 Scheduling Day ${targetDay} (ID: ${uniqueId}) for: ${scheduleDate.toLocaleString()}`);

            notificationsToSchedule.push({
                id: uniqueId,
                title: "🧠 It's Test Time!",
                body: "Keep your mind sharp! Tap to start.",
                channelId: 'reminder_channel',
                smallIcon: 'ic_launcher', 
                iconColor: '#10b981',
                actionTypeId: 'TAKE_TEST_ACTION',
                schedule: {
                    at: scheduleDate,
                    repeats: true,
                    every: 'week',
                    allowWhileIdle: true // CRITICAL for "Doze" mode
                }
            });
        });

        // 5. Send to OS
        if (notificationsToSchedule.length > 0) {
            await LocalNotifications.schedule({ notifications: notificationsToSchedule });
            debugLog(`✅ Successfully sent ${notificationsToSchedule.length} alarms to OS`);
            
            // Save to storage for UI restoration next time
            saveScheduleToStorage(hour, minute, period, dayCheckboxes);
            return true;
        }

    } catch (error) {
        debugError('Critical Scheduling Error', error);
        alert('Error setting up notifications.');
        return false;
    }
}

// --- 6. TEST FUNCTION ---

async function testNotification() {
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) return;

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        debugLog('🧪 Firing Test Notification in 5 seconds...');
        
        const testDate = new Date(Date.now() + 5000); // 5 seconds from now
        
        await LocalNotifications.schedule({
            notifications: [{
                id: 999, // Special ID for test
                title: "🧪 Test Success!",
                body: "If you see this, notifications are working.",
                channelId: 'reminder_channel',
                smallIcon: 'ic_launcher',
                iconColor: '#10b981',
                schedule: { 
                    at: testDate,
                    allowWhileIdle: true
                }
            }]
        });
    } catch (error) {
        debugError('Test failed', error);
    }
}

// Expose to Window
window.notificationSystem = {
    initializeCompleteNotificationSystem: async () => {
        debugLog('🔌 System initializing...');
        await initializeNotifications();
        const perm = await checkAndRequestPermissions();
        debugLog('🏁 System Ready');
        return { systemInitialized: true, permission: perm };
    },
    saveNotificationSchedule,
    testNotification,
    loadScheduleFromStorage
};

