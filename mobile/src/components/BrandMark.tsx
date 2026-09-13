import { Image, StyleSheet } from 'react-native';

interface BrandMarkProps {
  size?: number;
}

export default function BrandMark({ size = 36 }: BrandMarkProps) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[styles.mark, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  mark: {},
});
