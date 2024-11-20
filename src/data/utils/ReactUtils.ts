import { SeasonData } from '@interfaces/SeasonData';
import { SeriesData } from '@interfaces/SeriesData';
import { extractColors } from 'extract-colors';

export class ReactUtils {
    static colors: string[] = [];

    public static extractColorsFromImage = async (imgSrc: string) => {
        try {
            const options = {
                pixels: 50000, // Reduce the number of pixels to analyze to focus on prominent colors
                distance: 0.15, // Reduce color distance to get less variety
                saturationDistance: 0.5, // Reduce saturation distance to get less vibrant colors
                lightnessDistance: 0.12, // Reduce lightness distance to get darker colors
                hueDistance: 0.05, // Reduce hue distance to get colors closer to each other
            };
    
            const extractedColors = await extractColors(imgSrc, options);
            
            const dominantColors = extractedColors.slice(0, 5).map(color => color.hex);
            return dominantColors;
        } catch (error) {
            console.error("Error al extraer colores:", error);
            return undefined;
        }
    };

    public static getDominantColors = async (imgSrc: string) => {
        const dominantColors = await this.extractColorsFromImage(imgSrc);
            
        if (dominantColors)
            this.colors = dominantColors;
    }

    public static getGradientBackground = () => {
        if (this.colors.length >= 4) {
            //return `linear-gradient(to top right, ${this.colors.join(", ")})`;
            //return `linear-gradient(to bottom, ${this.colors[0]} 0%, ${this.colors[1]} 100%)`;
            return `radial-gradient(circle farthest-side at 0% 100%, ${this.colors[1]} 0%, rgba(48, 66, 66, 0) 100%),
                radial-gradient(circle farthest-side at 100% 100%, ${this.colors[0]} 0%, rgba(63, 77, 69, 0) 100%),
                radial-gradient(circle farthest-side at 100% 0%, ${this.colors[2]} 0%, rgba(33, 36, 33, 0) 100%),
                radial-gradient(circle farthest-side at 0% 0%, ${this.colors[3]} 0%, rgba(65, 77, 66, 0) 100%),
                black
                `;
        }
        return "none";
    };

    public static generateGradient = (
		collection: SeriesData | null,
		album: SeasonData | null
	) => {
		if (collection && !album) {
			if (collection.coverSrc !== "") {
				ReactUtils.getDominantColors(collection.coverSrc);
			} else {
				ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
			}
		} else if (collection && album) {
			if (album.coverSrc !== "") {
				ReactUtils.getDominantColors(album.coverSrc);
			} else if (collection.coverSrc !== "") {
				ReactUtils.getDominantColors(collection.coverSrc);
			} else {
				ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
			}
		}
	};

    public static formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    public static formatTimeForView = (time: number) => {
        const hours = Math.floor(time / 60);
        const minutes = Math.floor(time % 60);

        if (hours > 0){
            if (minutes > 0) {
                return `${hours}h ${minutes}m`
            } else {
                return `${hours}h`
            }
        } else {
            return `${minutes}m`
        }
    }
}