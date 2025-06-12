
import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';

interface WallpaperSlideshowProps {
  wallpaperIndex: number;
  onWallpaperChange?: (index: number) => void;
}

export function WallpaperSlideshow({ wallpaperIndex, onWallpaperChange }: WallpaperSlideshowProps) {
  const wallpapers = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&h=1080&fit=crop'
  ];

  const [currentIndex, setCurrentIndex] = useState(wallpaperIndex);

  useEffect(() => {
    setCurrentIndex(wallpaperIndex);
  }, [wallpaperIndex]);

  const handleWallpaperSelect = (index: number) => {
    setCurrentIndex(index);
    onWallpaperChange?.(index);
  };

  return (
    <div className="w-full">
      <Carousel className="w-full max-w-xs mx-auto">
        <CarouselContent>
          {wallpapers.map((wallpaper, index) => (
            <CarouselItem key={index}>
              <Card 
                className={`cursor-pointer transition-all ${currentIndex === index ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleWallpaperSelect(index)}
              >
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={wallpaper} 
                    alt={`Wallpaper ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
