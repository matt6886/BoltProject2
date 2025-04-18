import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal, Image } from 'react-native';
import { Share2, Copy, Check, Facebook, MessageCircle } from 'lucide-react-native';

type SocialShareProps = {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
};

const SOCIAL_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    logo: 'https://images.unsplash.com/photo-1633675254053-d96c7668c3b8?q=80&w=50&auto=format&fit=crop'
  },
  whatsapp: {
    name: 'WhatsApp',
    color: '#25D366',
    logo: 'https://images.unsplash.com/photo-1633674582318-000000000000?q=80&w=50&auto=format&fit=crop'
  }
};

export function SocialShare({ title, description, imageUrl, url }: SocialShareProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: keyof typeof SOCIAL_PLATFORMS) => {
    const shareData = {
      title,
      text: description,
      url: url || window.location.href
    };

    if (Platform.OS === 'web') {
      let shareUrl = '';
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)}`;
          break;
      }

      window.open(shareUrl, '_blank', 'width=600,height=400');
    } else {
      try {
        await Share.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    setShowMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = url || window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <Pressable 
        style={styles.shareButton}
        onPress={() => handleShare('whatsapp')}>
        <Share2 size={20} color="#FFFFFF" />
        <Text style={styles.shareText}>Partager</Text>
      </Pressable>
    );
  }

  return (
    <>
      <Pressable 
        style={styles.shareButton}
        onPress={() => setShowMenu(true)}>
        <Share2 size={20} color="#FFFFFF" />
        <Text style={styles.shareText}>Partager</Text>
      </Pressable>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}>
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
              <Pressable
                key={key}
                style={[styles.menuItem, { backgroundColor: platform.color }]}
                onPress={() => handleShare(key as keyof typeof SOCIAL_PLATFORMS)}>
                <View style={styles.iconContainer}>
                  {key === 'facebook' && (
                    <Facebook size={20} color="#FFFFFF" />
                  )}
                  {key === 'whatsapp' ? (
                    <MessageCircle size={20} color="#FFFFFF" />
                  ) : null}
                </View>
                <Text style={styles.menuItemText}>{platform.name}</Text>
              </Pressable>
            ))}
            
            <Pressable
              style={[styles.menuItem, styles.copyButton]}
              onPress={handleCopyLink}>
              <View style={styles.iconContainer}>
                {copied ? (
                  <Check size={20} color="#FFFFFF" />
                ) : (
                  <Copy size={20} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.menuItemText}>
                {copied ? 'Lien copié !' : 'Copier le lien'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A8DFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#3A8DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shareText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    width: '100%',
    maxWidth: 320,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  copyButton: {
    backgroundColor: '#424242',
  },
  iconContainer: {
    width: 20,
    height: 20,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});