import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { styles } from '../styles/HomeScreenStyles';

const Toast = ({ message, type = 'success', visible, onHide }) => {
    const translateY = new Animated.Value(-100);

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 8,
                }),
                Animated.delay(3000),
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => onHide && onHide());
        }
    }, [visible]);

    const getColor = () => {
        switch (type) {
            case 'success': return COLORS.success;
            case 'error': return COLORS.error;
            case 'warning': return COLORS.warning;
            case 'info': return COLORS.info;
            default: return COLORS.success;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'close-circle';
            case 'warning': return 'warning';
            case 'info': return 'information-circle';
            default: return 'checkmark-circle';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: getColor(), transform: [{ translateY }] },
            ]}
        >
            <Ionicons name={getIcon()} size={24} color={COLORS.white} />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        zIndex: 9999,
        ...SHADOWS.medium,
    },
    message: {
        color: COLORS.white,
        fontSize: SIZES.medium,
        fontWeight: '600',
        marginLeft: 12,
        flex: 1,
    },
});

export default Toast;