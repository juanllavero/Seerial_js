import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { useTranslation } from "react-i18next";
import { toggleSeasonWindow, updateSeason } from "redux/slices/dataSlice";
import ResolvedImage from "@components/Image";
import { TagsInput } from "react-tag-input-component";

const renderSeasonWindow = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const seasonMenuOpen = useSelector((state: RootState) => state.data.seasonWindowOpen);
    const library = useSelector((state: RootState) => state.data.selectedLibrary);
    const series = useSelector((state: RootState) => state.data.selectedSeries);
    const season = useSelector((state: RootState) => state.data.selectedSeason);

    const [resolution, setResolution] = useState({ width: 0, height: 0 });

    const [pasteUrl, setPasteUrl] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

    const [logos, setLogos] = useState<string[]>([]);
    const [posters, setPosters] = useState<string[]>([]);
    const [selectedLogo, selectLogo] = useState<string | undefined>(undefined);
    const [selectedPoster, selectPoster] = useState<string | undefined>(undefined);

    const [nameLock, setNameLock] = useState<boolean>(false);
    const [yearLock, setYearLock] = useState<boolean>(false);
    const [overviewLock, setOverviewLock] = useState<boolean>(false);
    const [studiosLock, setStudiosLock] = useState<boolean>(false);
    const [taglineLock, setTaglineLock] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [overview, setOverview] = useState<string>("");
    const [studios, setStudios] = useState<string[]>([""]);
    const [tagline, setTagline] = useState<string>("");

    useEffect(() => {
        const fetchLogos = async () => {
            setPasteUrl(false);
            
            const logoPath = await window.electronAPI.getExternalPath("resources/img/logos/" + season?.id + "/");
            if (logoPath) {
                const images = await window.electronAPI.getImages(logoPath);
                setLogos(images);
            }

            if (season?.logoSrc)
                selectLogo(season?.logoSrc.split('/').pop());
        }

        const fetchPosters = async () => {
            const posterPath = await window.electronAPI.getExternalPath("resources/img/seriesCovers/" + season?.id + "/");
            if (posterPath) {
                const images = await window.electronAPI.getImages(posterPath);
                setPosters(images);
            }

            if (season?.coverSrc)
                selectPoster(season?.coverSrc.split('/').pop());
        }

        if (menuSection === Section.Logos){
            fetchLogos().then(() => setImageDownloaded(false));
        }else if (menuSection === Section.Posters){
            fetchPosters().then(() => setImageDownloaded(false));
        }
    }, [menuSection, imageDownloaded]);

    useEffect(() => {
        if (seasonMenuOpen && season) {
            let noImages: string[] = [];
            setPosters(noImages);
            setLogos(noImages);
            dispatch(changeMenuSection(Section.General));

            setName(season.name);
            setYear(season.year);
            setOverview(season.overview);
            setStudios(["Test", "Studio"]);
            setTagline(season.tagline);

            setNameLock(season.nameLock);
            setYearLock(season.yearLock);
            setOverviewLock(season.overviewLock);
            setTaglineLock(season.taglineLock);
            setStudiosLock(season.studioLock);
        }
    }, [seasonMenuOpen]);

    useEffect(() => {
        window.ipcRenderer.on('download-complete', (_event, _message) => {
            setImageDownloaded(true);
        });

        window.ipcRenderer.on('download-error', (_event, message) => {
            alert(`Error: ${message}`);
        });
    }, []);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setResolution({
        width: img.naturalWidth,
        height: img.naturalHeight,
        });
    };

    const handleSavingChanges = () => {
        if (season) {
            dispatch(updateSeason({
                name: name,
                overview: overview,
                year: year,
                order: season.order,
                id: season.id,
                tagline: tagline,
                score: season.score,
                seasonNumber: season.seasonNumber,
                logoSrc: season.logoSrc,
                coverSrc: season.coverSrc,
                backgroundSrc: season.backgroundSrc,
                videoSrc: season.videoSrc,
                musicSrc: season.musicSrc,
                seriesID: season.seriesID,
                themdbID: season.themdbID,
                imdbID: season.imdbID,
                lastDisc: season.lastDisc,
                folder: season.folder,
                showName: season.showName,
                audioTrackLanguage: season.audioTrackLanguage,
                selectedAudioTrack: season.selectedAudioTrack,
                subtitleTrackLanguage: season.subtitleTrackLanguage,
                selectedSubtitleTrack: season.selectedSubtitleTrack,
                episodes: season.episodes,
                genres: season.genres,
                currentlyWatchingEpisode: season.currentlyWatchingEpisode,
                cast: season.cast,
                creator: season.creator,
                musicComposer: season.musicComposer,
                directedBy: season.directedBy,
                writtenBy: season.writtenBy,
                productionStudios: season.productionStudios,
                nameLock: season.nameLock,
                overviewLock: season.overviewLock,
                yearLock: season.yearLock,
                studioLock: season.studioLock,
                taglineLock: season.taglineLock
            }));
        }

        dispatch(toggleSeasonWindow());
    };

    const handleDownload = () => {
        setPasteUrl(false);
        window.ipcRenderer.send('download-image-url', imageUrl, "resources/img/discCovers/" + season?.id + "/");
    };

    return (
        <>
            <section className={`dialog ${seasonMenuOpen ? ' dialog-active' : ''}`}>
                <div className="dialog-background" onClick={() => dispatch(toggleSeasonWindow())}></div>
                <div className="dialog-box">
                <section className="dialog-top">
                    <span>{t('editButton') + ": " + (library?.type === "Shows" ? (series?.name + " - " + season?.name) : season?.name)}</span>
                    <button className="close-window-btn" onClick={() => dispatch(toggleSeasonWindow())}>
                    <img src="./src/assets/svg/windowClose.svg" 
                    style={{width: '24px', height: '24px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                    </button>
                </section>
                <section className="dialog-center">
                    <div className="dialog-center-left">
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.General ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.General))}>{t('generalButton')}</button>
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.Details ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.Details))}>{t('media')}</button>
                    {
                        library?.type !== "Shows" ? (
                            <>
                                <button className={`desktop-dialog-side-btn ${menuSection === Section.Logos ? ' desktop-dialog-side-btn-active' : ''}`}
                                onClick={() => dispatch(changeMenuSection(Section.Logos))}>{t('logosButton')}</button>
                                <button className={`desktop-dialog-side-btn ${menuSection === Section.Posters ? ' desktop-dialog-side-btn-active' : ''}`}
                                onClick={() => dispatch(changeMenuSection(Section.Posters))}>{t('postersButton')}</button>
                            </>
                        ) : series?.isCollection ? (
                            <button className={`desktop-dialog-side-btn ${menuSection === Section.Logos ? ' desktop-dialog-side-btn-active' : ''}`}
                            onClick={() => dispatch(changeMenuSection(Section.Logos))}>EtiquetasTEST</button>
                        ) : null
                    }
                    </div>
                    <div className="dialog-center-right scroll">
                    {
                        menuSection == Section.General ? (
                            !series?.isCollection ? (
                                <>
                                    <div className="dialog-input-box">
                                        <span>{t('name')}</span>
                                        <div className={`dialog-input-lock ${nameLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setNameLock(!nameLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={name} onChange={(e) => {
                                                setNameLock(true);
                                                setName(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('year')}</span>
                                        <div className={`dialog-input-lock ${yearLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setYearLock(!yearLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={year} onChange={(e) => {
                                                setYearLock(true);
                                                setYear(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('studios')}</span>
                                        <div className={`dialog-input-lock ${yearLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setStudiosLock(!yearLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <TagsInput
                                                value={studios}
                                                onChange={setStudios}
                                                name="studiosInput"
                                                placeHolder=""
                                            />
                                        </div>
                                    </div>
                                    {
                                        library?.type !== "Shows" ? (
                                            <div className="dialog-input-box">
                                                <span>{t('tagline')}</span>
                                                <div className={`dialog-input-lock ${yearLock ? ' locked' : ''}`}>
                                                    <a href="#" onClick={() => setTaglineLock(!yearLock)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                            <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                        </svg>
                                                    </a>
                                                    <input type="text" value={tagline} onChange={(e) => {
                                                        setTaglineLock(true);
                                                        setTagline(e.target.value);
                                                    }}/>
                                                </div>
                                            </div>
                                        ) : null
                                    }
                                    <div className="dialog-input-box">
                                        <span>{t('overview')}</span>
                                        <div className={`dialog-input-lock ${overviewLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setOverviewLock(!overviewLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <textarea rows={5} value={overview} onChange={(e) => {
                                                setOverviewLock(true);
                                                setOverview(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="dialog-input-box">
                                        <span>{t('name')}</span>
                                        <div className={`dialog-input-lock ${nameLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setNameLock(!nameLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={name} onChange={(e) => {
                                                setNameLock(true);
                                                setName(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('orderByTitle')}</span>
                                        <div className={`dialog-input-lock ${nameLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setNameLock(!nameLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={name} onChange={(e) => {
                                                setNameLock(true);
                                                setName(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('overview')}</span>
                                        <div className={`dialog-input-lock ${overviewLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setOverviewLock(!overviewLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <textarea rows={5} value={overview} onChange={(e) => {
                                                setOverviewLock(true);
                                                setOverview(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                </>
                            )
                        ) : menuSection == Section.Details ? (
                            <>
                                <div className="dialog-horizontal-box">
                                    <div className="dialog-input-box">
                                        <span>{t('backgroundVideo')}</span>
                                        <div className="media-input">
                                            <input type="text" value={name} onChange={(e) => {
                                                setNameLock(true);
                                                setName(e.target.value);
                                            }}/>
                                            <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeasonWindow())}>{t('loadButton')}</button>
                                            <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeasonWindow())}>{t('downloadButton')}</button>
                                            <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeasonWindow())}>{t('removeButton')}</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="dialog-horizontal-box">
                                    <div className="dialog-input-box">
                                        <span>{t('backgroundMusic')}</span>
                                        <div className="media-input">
                                            <input type="text" value={name} onChange={(e) => {
                                                setNameLock(true);
                                                setName(e.target.value);
                                            }}/>
                                            <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeasonWindow())}>{t('loadButton')}</button>
                                            <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeasonWindow())}>{t('downloadButton')}</button>
                                            <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeasonWindow())}>{t('removeButton')}</button>
                                        </div>
                                    </div>
                                </div>
                                {
                                    pasteUrl ? (
                                        <div className="dialog-horizontal-box horizontal-center-align">
                                            <div className="dialog-input-box">
                                                <input type="text" placeholder={t('urlText')} onChange={(e) => {
                                                    setImageUrl(e.target.value)
                                                }}/>
                                            </div>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                    {t('cancelButton')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={handleDownload}>
                                                {t('loadButton')}
                                            </button>
                                        </div>
                                    ) : null
                                }
                                <div className="dialog-horizontal-box">
                                    <div className="dialog-background-buttons">
                                        <span>{t('backgroundImage')}</span>
                                        <div>
                                            <button className="desktop-dialog-btn" title={t('loadButton')} onClick={() => dispatch(toggleSeasonWindow())}>
                                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 16 16" width="20" height="20"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" fill="#FFFFFF"></path><path d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z" fill="#FFFFFF"></path></svg>
                                            </button>
                                            <button className="desktop-dialog-btn" title={t('fromURLButton')} onClick={() => setPasteUrl(true)}>
                                                <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z" fill="#FFFFFF"></path></svg>
                                            </button>
                                            <button className="desktop-dialog-btn" title={t('downloadButton')} onClick={() => dispatch(toggleSeasonWindow())}>
                                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" height="20" viewBox="0 0 16 16" width="20" data-view-component="true">
                                                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a9.64 9.64 0 0 0 1.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0 0 10.22 8.75Zm4.44-1.5a9.64 9.64 0 0 0-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 0 0-.857 1.215A9.64 9.64 0 0 0 5.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 0 0 4.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.437-2.874-1.581-4.948Zm-2.733-1.5h2.733c.144-2.074.866-3.756 1.58-4.948.12-.197.237-.381.353-.552a6.507 6.507 0 0 0-4.666 5.5Zm10.181 1.5c-.144 2.074-.866 3.756-1.58 4.948-.12.197-.237.381-.353.552a6.507 6.507 0 0 0 4.666-5.5Zm2.733-1.5a6.507 6.507 0 0 0-4.666-5.5c.123.181.24.365.353.552.714 1.192 1.436 2.874 1.58 4.948Z" fill="#FFFFFF"></path>
                                                </svg>
                                            </button>
                                        </div>
                                        <span>{resolution.width}x{resolution.height}</span>
                                    </div>
                                    <ResolvedImage src={season?.backgroundSrc ? season.backgroundSrc : ''}
                                    id="seasonBackgroundImage"
                                    alt="Video Thumbnail"
                                    onError={(e: any) => {
                                        e.target.onerror = null; // To avoid infinite loop
                                        e.target.src = "./src/resources/img/Default_video_thumbnail.jpg";
                                    } }
                                    onLoad={handleImageLoad}/>
                                </div>
                            </>
                        ) : menuSection == Section.Logos ? (
                            <>
                                {
                                    pasteUrl ? (
                                        <div className="horizontal-center-align">
                                            <div className="dialog-input-box">
                                                <input type="text" placeholder={t('urlText')} onChange={(e) => {
                                                    setImageUrl(e.target.value)
                                                }}/>
                                            </div>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                    {t('cancelButton')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={handleDownload}>
                                                {t('loadButton')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="horizontal-center-align">
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                {t('selectImage')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(true)}>
                                                {t('fromURLButton')}
                                            </button>
                                        </div>
                                    )
                                }
                                
                                <div className="dialog-images-scroll">
                                {logos.map((image, index) => (
                                    <div key={image} className={`dialog-image-btn ${image.split('\\').pop() === selectedLogo ? ' dialog-image-btn-active' : ''}`}
                                    onClick={() => selectLogo(image.split('\\').pop())}>
                                        <img src={`file://${image}`} alt={`img-${index}`} style={{ width: 290 }} />
                                        {
                                            image.split('\\').pop() === selectedLogo ? (
                                                <>
                                                    <div className="triangle-tick"></div>
                                                    <svg aria-hidden="true" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M4 24.7518L18.6461 39.4008L44 14.0497L38.9502 9L18.6461 29.3069L9.04416 19.7076L4 24.7518Z" fill="#EEEEEE" fillRule="evenodd"></path></svg>
                                                </>
                                            ) : (null)
                                        }
                                    </div>
                                ))}
                                </div>
                            </>
                        ) : menuSection == Section.Posters ? (
                            <>
                                {
                                    pasteUrl ? (
                                        <div className="horizontal-center-align">
                                            <div className="dialog-input-box">
                                                <input type="text" placeholder={t('urlText')} onChange={(e) => {
                                                    setImageUrl(e.target.value)
                                                }}/>
                                            </div>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                    {t('cancelButton')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={handleDownload}>
                                                {t('loadButton')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="horizontal-center-align">
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                {t('selectImage')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(true)}>
                                                {t('fromURLButton')}
                                            </button>
                                        </div>
                                    )
                                }
                                
                                <div className="dialog-images-scroll">
                                {posters.map((image, index) => (
                                    <div key={image} className={`dialog-image-btn ${image.split('\\').pop() === selectedPoster ? ' dialog-image-btn-active' : ''}`}
                                    onClick={() => selectPoster(image.split('\\').pop())}>
                                        <img src={`file://${image}`} alt={`img-${index}`} style={{ width: 190 }} />
                                        {
                                            image.split('\\').pop() === selectedPoster ? (
                                                <>
                                                    <div className="triangle-tick"></div>
                                                    <svg aria-hidden="true" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M4 24.7518L18.6461 39.4008L44 14.0497L38.9502 9L18.6461 29.3069L9.04416 19.7076L4 24.7518Z" fill="#EEEEEE" fillRule="evenodd"></path></svg>
                                                </>
                                            ) : (null)
                                        }
                                    </div>
                                ))}
                                </div>
                            </>
                        ) : null
                    }
                    </div>
                </section>
                <section className="dialog-bottom">
                    <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeasonWindow())}>{t('cancelButton')}</button>
                    <button className="btn-app-color" onClick={() => handleSavingChanges()}>{t('saveButton')}</button>
                </section>
                </div>
            </section>
        </>
    )
};

export default renderSeasonWindow;