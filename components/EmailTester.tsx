import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react-native';
import EmailService, { EmailTestResult } from '../services/email';

export function EmailTester() {
  const [testResults, setTestResults] = useState<EmailTestResult[]>([]);
  const [diagnostics, setDiagnostics] = useState<{
    status: 'success' | 'warning' | 'error';
    message: string;
    checks: Array<{ name: string; passed: boolean; message: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    setLoading(true);
    try {
      const results = EmailService.getTestResults();
      setTestResults(results);
      const diagnosticsResult = await EmailService.runDiagnostics();
      setDiagnostics(diagnosticsResult);
    } catch (error) {
      console.error('Error loading test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setLoading(true);
    try {
      const result = await EmailService.sendVerificationEmail();
      setTestResults(prev => [...prev, result]);
      await loadTestResults();
    } catch (error) {
      console.error('Error sending verification email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setLoading(true);
    try {
      const result = await EmailService.sendPasswordReset('test@example.com');
      setTestResults(prev => [...prev, result]);
      await loadTestResults();
    } catch (error) {
      console.error('Error sending password reset:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={24} color="#4CAF50" />;
      case 'warning':
        return <AlertTriangle size={24} color="#FFC107" />;
      case 'error':
        return <XCircle size={24} color="#FF5252" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Email System Diagnostics</Text>
        {diagnostics && (
          <View style={styles.diagnosticsContainer}>
            <View style={styles.statusHeader}>
              {renderStatusIcon(diagnostics.status)}
              <Text style={[
                styles.statusText,
                { color: diagnostics.status === 'success' ? '#4CAF50' : 
                         diagnostics.status === 'warning' ? '#FFC107' : '#FF5252' }
              ]}>
                {diagnostics.message}
              </Text>
            </View>
            
            {diagnostics.checks.map((check, index) => (
              <View key={index} style={styles.checkItem}>
                {renderStatusIcon(check.passed ? 'success' : 'error')}
                <View style={styles.checkContent}>
                  <Text style={styles.checkName}>{check.name}</Text>
                  <Text style={styles.checkMessage}>{check.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendVerificationEmail}
          disabled={loading}>
          <Text style={styles.buttonText}>Test Verification Email</Text>
        </Pressable>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendPasswordReset}
          disabled={loading}>
          <Text style={styles.buttonText}>Test Password Reset</Text>
        </Pressable>
      </View>

      <View style={styles.results}>
        <Text style={styles.subtitle}>Test Results</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            {renderStatusIcon(result.success ? 'success' : 'error')}
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>{result.message}</Text>
              <Text style={styles.resultDetails}>
                Type: {result.details?.type}
                {'\n'}To: {result.details?.to}
                {'\n'}Time: {new Date(result.timestamp).toLocaleString()}
              </Text>
              {result.details?.error && (
                <Text style={styles.errorText}>{result.details.error}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  diagnosticsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  checkContent: {
    flex: 1,
  },
  checkName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkMessage: {
    fontSize: 14,
    color: '#666666',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3A8DFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    gap: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    color: '#FF5252',
    marginTop: 8,
  },
});