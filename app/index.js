/** index */
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

export default function Index() {
    const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
        // console.log('Received a notification in the background!');
        console.log(data);
    });
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
}
