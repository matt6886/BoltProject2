import { auth } from './firebase';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

export type EmailTestResult = {
  success: boolean;
  message: string;
  timestamp: string;
  details?: {
    to: string;
    type: 'verification' | 'reset' | 'custom';
    delivered?: boolean;
    error?: string;
  };
};

class EmailService {
  private static logResults: EmailTestResult[] = [];

  static async sendVerificationEmail(): Promise<EmailTestResult> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await sendEmailVerification(user);

      const result: EmailTestResult = {
        success: true,
        message: 'Verification email sent successfully',
        timestamp: new Date().toISOString(),
        details: {
          to: user.email || 'unknown',
          type: 'verification',
          delivered: true
        }
      };

      this.logResults.push(result);
      return result;
    } catch (error) {
      const result: EmailTestResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send verification email',
        timestamp: new Date().toISOString(),
        details: {
          to: auth.currentUser?.email || 'unknown',
          type: 'verification',
          delivered: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };

      this.logResults.push(result);
      return result;
    }
  }

  static async sendPasswordReset(email: string): Promise<EmailTestResult> {
    try {
      await sendPasswordResetEmail(auth, email);

      const result: EmailTestResult = {
        success: true,
        message: 'Password reset email sent successfully',
        timestamp: new Date().toISOString(),
        details: {
          to: email,
          type: 'reset',
          delivered: true
        }
      };

      this.logResults.push(result);
      return result;
    } catch (error) {
      const result: EmailTestResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send password reset email',
        timestamp: new Date().toISOString(),
        details: {
          to: email,
          type: 'reset',
          delivered: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };

      this.logResults.push(result);
      return result;
    }
  }

  static getTestResults(): EmailTestResult[] {
    return this.logResults;
  }

  static clearTestResults(): void {
    this.logResults = [];
  }

  static validateEmailDelivery(result: EmailTestResult): boolean {
    return (
      result.success &&
      result.details?.delivered === true &&
      !result.details?.error
    );
  }

  static async runDiagnostics(): Promise<{
    status: 'success' | 'warning' | 'error';
    message: string;
    checks: Array<{ name: string; passed: boolean; message: string }>;
  }> {
    const checks = [];
    let status: 'success' | 'warning' | 'error' = 'success';

    // Check Firebase initialization
    try {
      const firebaseCheck = {
        name: 'Firebase Configuration',
        passed: Boolean(auth.app),
        message: ''
      };
      
      firebaseCheck.message = firebaseCheck.passed
        ? 'Firebase is properly initialized'
        : 'Firebase is not properly initialized';
      
      checks.push(firebaseCheck);
      
      if (!firebaseCheck.passed) {
        status = 'error';
      }
    } catch (error) {
      checks.push({
        name: 'Firebase Configuration',
        passed: false,
        message: 'Failed to check Firebase configuration'
      });
      status = 'error';
    }

    // Check recent email deliveries
    const recentResults = this.logResults.slice(-5);
    const deliveryCheck = {
      name: 'Recent Email Deliveries',
      passed: true,
      message: ''
    };

    if (recentResults.length === 0) {
      deliveryCheck.passed = true;
      deliveryCheck.message = 'No recent email attempts';
      status = 'warning';
    } else {
      const failedDeliveries = recentResults.filter(result => !result.success);
      deliveryCheck.passed = failedDeliveries.length === 0;
      deliveryCheck.message = deliveryCheck.passed
        ? 'All recent emails were delivered successfully'
        : `${failedDeliveries.length} out of ${recentResults.length} recent emails failed`;
      
      if (!deliveryCheck.passed) {
        status = 'warning';
      }
    }
    checks.push(deliveryCheck);

    return {
      status,
      message: status === 'success'
        ? 'All email systems are functioning normally'
        : status === 'warning'
        ? 'Email systems are functioning with some warnings'
        : 'Email systems are not functioning correctly',
      checks
    };
  }
}

export default EmailService;