// notification.js - Comprehensive Notification System with Debug Logging


// Constants
const NOTIFICATION_SCHEDULE_KEY = 'ghani_notification_schedule';

// Add this to js/notification.js (Global Scope)

// 1. Capture Global Errors (Crashes)
window.onerror = function(msg, url, line, col, error) {
    const log = `❌ ERROR: ${msg}\nLine: ${line}`;
    debugError(log); // This sends it to your visual panel
    return false;
};

// 2. Capture Standard Console Logs
const originalLog = console.log;
console.log = function(...args) {
    // Print to the real internal console (for Android Studio)
    originalLog.apply(console, args);
    
    // Print to your visual panel
    // We join arguments to handle cases like console.log("Count:", 5)
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    // Only show if it's not a duplicate notification debug
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
        
        // Also show in UI if debug element exists
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

// Save schedule to localStorage
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

// Load schedule from localStorage and populate the form
function loadScheduleFromStorage() {
    try {
        const savedSchedule = localStorage.getItem(NOTIFICATION_SCHEDULE_KEY);
        if (savedSchedule) {
            const schedule = JSON.parse(savedSchedule);
            
            // Set time inputs
            if (schedule.hour) document.getElementById('notify-hour').value = schedule.hour;
            if (schedule.minute) document.getElementById('notify-minute').value = schedule.minute;
            if (schedule.period) document.getElementById('notify-period').value = schedule.period;
            
            // Set day checkboxes
            if (schedule.days && schedule.days.length > 0) {
                const allDayCheckboxes = document.querySelectorAll('.day-checkbox');
                allDayCheckboxes.forEach(checkbox => {
                    checkbox.checked = schedule.days.includes(checkbox.value);
                });
            }
            
            debugLog('Loaded schedule from storage', schedule);
            return true;
        }
        debugLog('No saved schedule found in storage');
        return false;
    } catch (error) {
        debugError('Error loading schedule from storage', error);
        return false;
    }
}

// Check if Capacitor and LocalNotifications are available
function checkCapacitorAvailability() {
    const capacitorAvailable = !!window.Capacitor;
    const notificationsAvailable = !!(window.Capacitor?.Plugins?.LocalNotifications);
    
    debugLog('Capacitor Availability Check', {
        capacitorAvailable,
        notificationsAvailable,
        plugins: window.Capacitor?.Plugins ? Object.keys(window.Capacitor.Plugins) : 'No plugins'
    });
    
    return { capacitorAvailable, notificationsAvailable };
}

// Initialize notification channel (CRITICAL for Android)
async function initializeNotifications() {
    debugLog('Starting notification channel initialization...');
    
    const { capacitorAvailable, notificationsAvailable } = checkCapacitorAvailability();
    
    if (!notificationsAvailable) {
        debugError('LocalNotifications plugin not available');
        return false;
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        debugLog('Creating notification channel...');
        
        // Create a High Importance Channel (Required for Android Sound/Popup)
        await LocalNotifications.createChannel({
            id: 'reminder_channel',
            name: 'Daily Reminders',
            description: 'Reminders to take your test',
            importance: 5, // 5 = High (makes sound and pops up)
            visibility: 1,
            vibration: true
        });
        
        debugLog('✅ Notification channel created successfully');
        return true;
    } catch (error) {
        debugError('❌ Failed to create notification channel', error);
        return false;
    }
}

// Main Notification System
async function initializeNotificationSystem() {
    debugLog('Starting main notification system initialization...');
    
    const { notificationsAvailable } = checkCapacitorAvailability();
    
    if (!notificationsAvailable) {
        debugError('LocalNotifications plugin not available for system init');
        return false;
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        debugLog('Registering action types...');
        
        // Register action types for the "Start Test" button
        await LocalNotifications.registerActionTypes({
            types: [
                {
                    id: 'TAKE_TEST_ACTION',
                    actions: [
                        {
                            id: 'start',
                            title: 'Start Test',
                            foreground: true
                        },
                        {
                            id: 'dismiss',
                            title: 'Dismiss',
                            destructive: true
                        }
                    ]
                }
            ]
        });

        debugLog('Setting up notification action listener...');
        
        // Listen for notification actions
        LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
            debugLog('Notification action performed', action);
            if (action.actionId === 'start') {
                window.location.href = 'wat-test.html';
            }
        });

        debugLog('✅ Notification system initialized successfully');
        return true;
    } catch (error) {
        debugError('❌ Error initializing notification system', error);
        return false;
    }
}

// Check and request notification permissions
async function checkAndRequestPermissions() {
    debugLog('Checking notification permissions...');
    
    const { notificationsAvailable } = checkCapacitorAvailability();
    
    if (!notificationsAvailable) {
        debugError('Cannot check permissions - notifications not available');
        return { granted: false, reason: 'notifications_not_available' };
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        const permission = await LocalNotifications.requestPermissions();
        debugLog('Permission request result', permission);
        
        return {
            granted: permission.display === 'granted',
            permission: permission
        };
    } catch (error) {
        debugError('Error requesting permissions', error);
        return { granted: false, reason: 'request_failed', error: error };
    }
}

// Get pending notifications for debugging
async function getPendingNotifications() {
    debugLog('Checking pending notifications...');
    
    const { notificationsAvailable } = checkCapacitorAvailability();
    
    if (!notificationsAvailable) {
        return { count: 0, notifications: [], error: 'not_available' };
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        const pending = await LocalNotifications.getPending();
        debugLog(`Found ${pending.notifications?.length || 0} pending notifications`, pending.notifications);
        return pending;
    } catch (error) {
        debugError('Error getting pending notifications', error);
        return { count: 0, notifications: [], error: error };
    }
}

// Clear all notifications
async function clearAllNotifications() {
    debugLog('Clearing all notifications...');
    
    const { notificationsAvailable } = checkCapacitorAvailability();
    
    if (!notificationsAvailable) {
        debugError('Cannot clear notifications - not available');
        return false;
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications && pending.notifications.length > 0) {
            await LocalNotifications.cancel({ 
                notifications: pending.notifications 
            });
            debugLog(`✅ Cleared ${pending.notifications.length} notifications`);
        } else {
            debugLog('No notifications to clear');
        }
        return true;
    } catch (error) {
        debugError('Error clearing notifications', error);
        return false;
    }
}

// Convert 12-hour time to 24-hour time
function convertTo24Hour(hour, minute, period) {
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
    }
    
    const result = { hour: hour24, minute: parseInt(minute) };
    debugLog(`Time conversion: ${hour}:${minute} ${period} -> ${hour24}:${minute}`, result);
    
    return result;
}

// Helper function to calculate next occurrence of a weekday
function getNextWeekday(dayOfWeek, hour, minute) {
    const now = new Date();
    const result = new Date();
    
    // Set the exact time
    result.setHours(hour, minute, 0, 0);
    
    // Calculate days until next occurrence
    let daysUntilNext = dayOfWeek - now.getDay();
    if (daysUntilNext < 0 || (daysUntilNext === 0 && result <= now)) {
        daysUntilNext += 7;
    }
    
    result.setDate(now.getDate() + daysUntilNext);
    
    // Double-check we're not scheduling in the past
    if (result <= now) {
        result.setDate(result.getDate() + 7);
    }
    
    debugLog(`Scheduled: ${result.toString()}, Day: ${getDayName(dayOfWeek)}, Time: ${hour}:${minute.toString().padStart(2, '0')}`);
    return result;
}

// Helper function to get day name
function getDayName(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
}

// Main notification scheduling function
async function saveNotificationSchedule() {
    debugLog('=== STARTING NOTIFICATION SCHEDULING PROCESS ===');
    
    // Check availability first
    const { notificationsAvailable } = checkCapacitorAvailability();
    if (!notificationsAvailable) {
        const errorMsg = '❌ Notifications not supported in this environment';
        debugError(errorMsg);
        alert(errorMsg);
        return false;
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        // Step 1: Request permissions
        debugLog('Step 1: Requesting permissions...');
        const permissionResult = await checkAndRequestPermissions();
        if (!permissionResult.granted) {
            const errorMsg = 'Notification permission denied. Please enable notifications in your device settings.';
            debugError(errorMsg, permissionResult);
            alert(errorMsg);
            return false;
        }
        debugLog('✅ Permissions granted');

        // Step 2: Clear existing notifications
        debugLog('Step 2: Clearing existing notifications...');
        await clearAllNotifications();

        // Step 3: Get user selections
        debugLog('Step 3: Getting user selections...');
        const hour = document.getElementById('notify-hour').value;
        const minute = document.getElementById('notify-minute').value;
        const period = document.getElementById('notify-period').value;
        
        const { hour: hour24, minute: minute24 } = convertTo24Hour(hour, minute, period);
        
        const dayCheckboxes = document.querySelectorAll('.day-checkbox:checked');
        
        if (dayCheckboxes.length === 0) {
            const errorMsg = 'Please select at least one day for reminders';
            debugError(errorMsg);
            alert(errorMsg);
            return false;
        }

        debugLog('User selections', {
            hour, minute, period, 
            hour24, minute24,
            days: Array.from(dayCheckboxes).map(cb => cb.value)
        });

        // Step 4: Schedule notifications
        debugLog('Step 4: Scheduling notifications...');
        const notificationsToSchedule = [];

        dayCheckboxes.forEach(checkbox => {
            const dayOfWeek = parseInt(checkbox.value);
            const nextDate = getNextWeekday(dayOfWeek, hour24, minute24);
            
            const notification = {
                id: dayOfWeek + 100,
                title: "🧠 It's Test Time!",
                body: "Your daily reminder to take a psychological test. Tap to start!",
                channelId: 'reminder_channel',
                smallIcon: 'res://mipmap/ic_launcher',
                largeIcon: 'res://mipmap/ic_launcher',
                actionTypeId: 'TAKE_TEST_ACTION',
                schedule: {
                    at: nextDate,
                    repeats: true,
                    every: 'week',
                    allowWhileIdle: true
                },
                autoCancel: false
            };
            
            notificationsToSchedule.push(notification);
            debugLog(`Scheduled notification for ${getDayName(dayOfWeek)}`, notification);
        });

        // Step 5: Send to Capacitor
        debugLog('Step 5: Sending to Capacitor scheduler...');
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        debugLog(`✅ Successfully scheduled ${notificationsToSchedule.length} notifications`);

        // Step 6: Save to storage
        debugLog('Step 6: Saving schedule to storage...');
        saveScheduleToStorage(hour, minute, period, dayCheckboxes);

        // Step 7: Verify scheduling worked
        debugLog('Step 7: Verifying scheduling...');
        const pendingCheck = await getPendingNotifications();
        
        // Step 8: Show success
        const nextTime = new Date(notificationsToSchedule[0].schedule.at).toLocaleString();
        const successMsg = `Scheduled ${notificationsToSchedule.length} notifications! Next: ${nextTime}. Pending: ${pendingCheck.notifications?.length || 0}`;
        
        debugLog(`✅ ${successMsg}`);
        
        const notificationStatus = document.getElementById('notificationStatus');
        if (notificationStatus) {
            notificationStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${successMsg}`;
            notificationStatus.classList.remove('hidden');
        }

        // Step 9: Check battery optimization
        debugLog('Step 9: Checking battery optimization...');
        setTimeout(() => checkBatteryOptimization(), 1000);
        
        debugLog('=== NOTIFICATION SCHEDULING COMPLETED SUCCESSFULLY ===');
        return true;

    } catch (error) {
        debugError('❌ NOTIFICATION SCHEDULING FAILED', error);
        alert('Error setting up notifications. Check console for details.');
        return false;
    }
}

// Test notification
async function testNotification() {
    debugLog('=== TESTING NOTIFICATION ===');
    
    const { notificationsAvailable } = checkCapacitorAvailability();
    
    if (!notificationsAvailable) {
        const errorMsg = 'Notifications not supported in this environment';
        debugError(errorMsg);
        alert(errorMsg);
        return;
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
        debugLog('Scheduling test notification...');
        
        await LocalNotifications.schedule({
            notifications: [{
                id: 999,
                title: "🧠 Test Notification!",
                body: "This is a test of your reminder system!",
                channelId: 'reminder_channel',
                smallIcon: 'res://mipmap/ic_launcher',
                largeIcon: 'res://mipmap/ic_launcher',
                actionTypeId: 'TAKE_TEST_ACTION',
                schedule: { at: new Date(Date.now() + 3000) } // 3 seconds
            }]
        });
        
        debugLog('✅ Test notification scheduled to show in 3 seconds');
        alert('Test notification scheduled! It will appear in 3 seconds.');
    } catch (error) {
        debugError('❌ Error showing test notification', error);
        alert('Error showing test notification. Check console.');
    }
}

// Check battery optimization
// Fixed battery optimization check
async function checkBatteryOptimization() {
    debugLog('Checking battery optimization...');
    
    // Add timeout protection
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ timedOut: true }), 3000);
    });
    
    const deviceInfoPromise = new Promise(async (resolve) => {
        try {
            if (window.Capacitor?.Plugins?.Device) {
                const { Device } = window.Capacitor.Plugins;
                const info = await Device.getInfo();
                resolve({ success: true, info });
            } else {
                resolve({ success: false, error: 'Device plugin not available' });
            }
        } catch (error) {
            resolve({ success: false, error });
        }
    });
    
    // Race between device info and timeout
    const result = await Promise.race([deviceInfoPromise, timeoutPromise]);
    
    if (result.timedOut) {
        debugError('Device.getInfo() timed out after 3 seconds');
    } else if (result.success) {
        debugLog('Device info', result.info);
    } else {
        debugError('Device info failed', result.error);
    }
    
    // Show battery optimization instructions regardless
    if (!sessionStorage.getItem('battery_optimization_shown')) {
        setTimeout(() => {
            if (confirm('For reliable notifications when app is closed, please disable battery optimization for Ghani. Show instructions?')) {
                alert('Go to: Settings > Apps > Ghani > Battery > Battery optimization > Select "Don\'t optimize"');
            }
            sessionStorage.setItem('battery_optimization_shown', 'true');
        }, 1000);
    }
}

// Initialize complete notification system
async function initializeCompleteNotificationSystem() {
    debugLog('=== INITIALIZING COMPLETE NOTIFICATION SYSTEM ===');
    
    const results = {
        channelInitialized: false,
        systemInitialized: false,
        permissions: null,
        pendingNotifications: null
    };
    
    try {
        // Initialize channel
        results.channelInitialized = await initializeNotifications();
        
        // Initialize system
        results.systemInitialized = await initializeNotificationSystem();
        
        // Check permissions
        results.permissions = await checkAndRequestPermissions();
        
        // Check existing notifications
        results.pendingNotifications = await getPendingNotifications();
        
        debugLog('Notification system initialization complete', results);
        
        return results;
    } catch (error) {
        debugError('Notification system initialization failed', error);
        return { ...results, error: error };
    }
}

// Make functions globally available
window.notificationSystem = {
    initializeCompleteNotificationSystem,
    saveNotificationSchedule,
    testNotification,
    getPendingNotifications,
    clearAllNotifications,
    checkAndRequestPermissions,
    loadScheduleFromStorage,
    debugLog,
    debugError
};

debugLog('Notification system loaded and ready');