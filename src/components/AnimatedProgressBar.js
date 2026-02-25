import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const AnimatedProgressBar = ({ progress, height = 12, showLabel = true }) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedWidth, {
            toValue: progress,
            useNativeDriver: false,
            friction: 8,
        }).start();
    }, [progress]);

    const widthInterpolated = animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const getColor = () => {
        if (progress < 50) return COLORS.info;
        if (progress < 80) return COLORS.success;
        if (progress <= 100) return COLORS.primary;
        return COLORS.error;
    };

    return (
        <View>
            <View style={[styles.container, { height }]}>
                <Animated.View
                    style={[
                        styles.progress,
                        {
                            width: widthInterpolated,
                            backgroundColor: getColor(),
                            height,
                        },
                    ]}
                />
            </View>
            {showLabel && (
                <Text style={styles.label}>{Math.round(progress)}%</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: COLORS.backgroundDark,
        borderRadius: 100,
        overflow: 'hidden',
    },
    progress: {
        borderRadius: 100,
    },
    label: {
        textAlign: 'right',
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginTop: 4,
    },
});

export default AnimatedProgressBar;