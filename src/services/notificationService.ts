import { toast } from 'react-hot-toast';

export interface NotificationSubscription {
  featureName: string;
  userEmail: string;
  userId: string;
  subscribedAt: Date;
  notified: boolean;
}

class NotificationService {
  private subscribers: Map<string, NotificationSubscription[]> = new Map();

  /**
   * Subscribe a user to notifications for a specific feature
   */
  subscribeToFeature(featureName: string, userEmail: string, userId: string): void {
    const subscription: NotificationSubscription = {
      featureName,
      userEmail,
      userId,
      subscribedAt: new Date(),
      notified: false,
    };

    const existing = this.subscribers.get(featureName) || [];

    // Check if user is already subscribed
    const isAlreadySubscribed = existing.some(sub => sub.userId === userId);

    if (isAlreadySubscribed) {
      toast.success('You are already subscribed to notifications for this feature!');
      return;
    }

    existing.push(subscription);
    this.subscribers.set(featureName, existing);

    // Store in localStorage for persistence
    this.saveToStorage();

    toast.success(`You'll be notified when ${featureName} is ready!`);
  }

  /**
   * Get all subscriptions for a specific feature
   */
  getSubscriptions(featureName: string): NotificationSubscription[] {
    return this.subscribers.get(featureName) || [];
  }

  /**
   * Get all subscriptions for a specific user
   */
  getUserSubscriptions(userId: string): NotificationSubscription[] {
    const allSubscriptions: NotificationSubscription[] = [];

    for (const [featureName, subscriptions] of this.subscribers.entries()) {
      const userSubs = subscriptions.filter(sub => sub.userId === userId);
      allSubscriptions.push(...userSubs);
    }

    return allSubscriptions;
  }

  /**
   * Unsubscribe a user from a specific feature
   */
  unsubscribeFromFeature(featureName: string, userId: string): void {
    const existing = this.subscribers.get(featureName) || [];
    const filtered = existing.filter(sub => sub.userId !== userId);

    this.subscribers.set(featureName, filtered);
    this.saveToStorage();

    toast.success(`Unsubscribed from ${featureName} notifications`);
  }

  /**
   * Mark all users as notified for a specific feature
   */
  markFeatureAsReleased(featureName: string): void {
    const subscriptions = this.subscribers.get(featureName) || [];

    subscriptions.forEach(sub => {
      sub.notified = true;
    });

    this.subscribers.set(featureName, subscriptions);
    this.saveToStorage();

    // In a real app, this would send actual notifications
    console.log(`Feature ${featureName} marked as released. ${subscriptions.length} users to notify.`);
  }

  /**
   * Get statistics about feature subscriptions
   */
  getSubscriptionStats(): { [featureName: string]: number } {
    const stats: { [featureName: string]: number } = {};

    for (const [featureName, subscriptions] of this.subscribers.entries()) {
      stats[featureName] = subscriptions.length;
    }

    return stats;
  }

  /**
   * Save subscriptions to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.subscribers.entries());
      localStorage.setItem('feature_subscriptions', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save subscriptions to storage:', error);
    }
  }

  /**
   * Load subscriptions from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('feature_subscriptions');
      if (data) {
        const parsed = JSON.parse(data);
        this.subscribers = new Map(parsed);

        // Convert date strings back to Date objects
        for (const [featureName, subscriptions] of this.subscribers.entries()) {
          subscriptions.forEach(sub => {
            sub.subscribedAt = new Date(sub.subscribedAt);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load subscriptions from storage:', error);
      this.subscribers = new Map();
    }
  }

  /**
   * Initialize the service
   */
  init(): void {
    this.loadFromStorage();
  }

  /**
   * Clear all subscriptions (for testing/admin purposes)
   */
  clearAllSubscriptions(): void {
    this.subscribers.clear();
    localStorage.removeItem('feature_subscriptions');
    toast.success('All subscriptions cleared');
  }

  /**
   * Export subscriptions data (for admin purposes)
   */
  exportSubscriptions(): string {
    const data = Array.from(this.subscribers.entries());
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import subscriptions data (for admin purposes)
   */
  importSubscriptions(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.subscribers = new Map(parsed);
      this.saveToStorage();
      toast.success('Subscriptions imported successfully');
    } catch (error) {
      toast.error('Failed to import subscriptions: Invalid data format');
    }
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// Initialize the service
notificationService.init();

export default notificationService;
