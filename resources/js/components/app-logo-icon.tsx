import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    // Filter out SVG-specific attributes that might cause issues with img tag
    const { viewBox, ...imgProps } = props as any;

    return (
        <img
            src="/icon.png"
            alt="App Logo Icon"
            {...imgProps}
        />
    );
}
