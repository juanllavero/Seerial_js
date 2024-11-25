import { useDispatch, useSelector } from "react-redux";
import {
	selectLibrary,
	setLibraryForMenu,
	toggleLibraryEditWindow,
	resetSelection,
	setLibraries,
} from "../../redux/slices/dataSlice";
import { removeTransparentImage } from "../../redux/slices/transparentImageLoadedSlice";
import { RootState } from "../../redux/store";
import {
	closeAllMenus,
	toggleLibraryMenu,
} from "redux/slices/contextMenuSlice";
import { useCallback, useRef } from "react";
import { ContextMenu } from "primereact/contextmenu";
import { useTranslation } from "react-i18next";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {
	HomeIcon,
	MoviesIcon,
	MusicIcon,
	ShowsIcon,
	VerticalDotsIcon,
} from "@components/utils/IconLibrary";
import { LibraryData } from "@interfaces/LibraryData";
import { RightPanelSections } from "@data/enums/Sections";
import { useSectionContext } from "context/section.context";
import "./LibrariesList.scss";

/**
 * A component that displays a list of libraries and allows the user to select a library,
 * open the library menu, edit the library, update the library, and remove the library.
 *
 * @returns A JSX element that displays the list of libraries.
 */
function LibrariesList() {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { setCurrentRightSection } = useSectionContext();
	const libraries = useSelector((state: RootState) => state.data.libraries);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	const libraryMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.libraryMenu
	);
	const libraryForMenu = useSelector(
		(state: RootState) => state.data.libraryForMenu
	);

	const cm = useRef<ContextMenu | null>(null);

	const menuItems = [
		{
			label: t("editButton"),
			command: () => {
				dispatch(toggleLibraryEditWindow());
			},
		},
		{
			label: t("searchFiles"),
			command: () => {
				dispatch(toggleLibraryMenu());
			},
		},
		{
			label: t("updateMetadata"),
			command: () => {
				dispatch(toggleLibraryMenu());
			},
		},
		{
			label: t("removeButton"),
			command: () => {
				showDeleteDialog();
				dispatch(toggleLibraryMenu());
			},
		},
	];

	const showDeleteDialog = () => {
		confirmDialog({
			message: t("removeLibraryMessage"),
			header: `${t("removeLibrary")}: ${libraryForMenu?.name}`,
			icon: "pi pi-info-circle",
			defaultFocus: "reject",
			acceptClassName: "p-button-danger",
			accept,
		});
	};

	const accept = () => {
		if (libraryForMenu) {
			window.electronAPI.deleteLibrary(libraryForMenu);
		}
	};

	const handleSelectLibrary = useCallback(
		(library: LibraryData | null) => {
			dispatch(selectLibrary(library));
			dispatch(resetSelection());
			dispatch(removeTransparentImage());

			if (library === null) {
				setCurrentRightSection(RightPanelSections.Home);
			} else if (library.type === "Shows" || library.type === "Movies") {
				setCurrentRightSection(RightPanelSections.Collections);
			} else {
				setCurrentRightSection(RightPanelSections.MusicAlbums);
			}
		},
		[dispatch]
	);

	const draggingIndexRef = useRef<number | null>(null); // Índice del elemento arrastrado

	const handleDragStart = (index: number) => {
		draggingIndexRef.current = index; // Guarda el índice del elemento arrastrado
		const dragItem = document.querySelectorAll(".libraries-button")[index];
		dragItem?.classList.add("dragging");
	};

	const handleDragEnd = () => {
		const dragItem = document.querySelector(".dragging");
		dragItem?.classList.remove("dragging");
		draggingIndexRef.current = null; // Resetea el índice arrastrado
	};

	const handleDragOver = (index: number, e: React.DragEvent) => {
		e.preventDefault();
		const draggingIndex = draggingIndexRef.current;

		// Evita operaciones innecesarias si el índice no ha cambiado
		if (draggingIndex === null || draggingIndex === index) return;

		// Actualiza el orden de las bibliotecas localmente
		const updatedLibraries = [...libraries];
		const [removedItem] = updatedLibraries.splice(draggingIndex, 1);
		updatedLibraries.splice(index, 0, removedItem);

		// Actualiza el índice en la referencia
		draggingIndexRef.current = index;

		// Renderiza el nuevo orden en la UI (sin actualizar Redux aún)
		dispatch(setLibraries(updatedLibraries));
	};

	return (
		<>
			<ConfirmDialog />
			<div className="libraries-list scroll">
				<button
					className={`libraries-button ${
						selectedLibrary === null ? "selected" : ""
					}`}
					title={t("home")}
				>
					<HomeIcon onClick={() => handleSelectLibrary(null)} />
					<span
						className="library-name"
						onClick={() => handleSelectLibrary(null)}
					>
						{t("home")}
					</span>
				</button>
				{libraries.map((library, index) => (
					<button
						key={library.id}
						className={`libraries-button ${
							library === selectedLibrary ? "selected" : ""
						}`}
						title={library.name}
						draggable
						onDragStart={() => handleDragStart(index)}
						onDragEnd={() => handleDragEnd(index)}
						onDragOver={(e) => handleDragOver(index, e)}
					>
						{library.type === "Shows" ? (
							<ShowsIcon onClick={() => handleSelectLibrary(library)} />
						) : library.type === "Movies" ? (
							<MoviesIcon onClick={() => handleSelectLibrary(library)} />
						) : (
							<MusicIcon onClick={() => handleSelectLibrary(library)} />
						)}
						<span
							className="library-name"
							onClick={() => handleSelectLibrary(library)}
						>
							{library.name}
						</span>

						<div>
							<a
								id={library.id + "btn"}
								className={`svg-button-desktop-transparent select ${
									libraryMenuOpen && library == libraryForMenu
										? " active-btn"
										: " inactive-btn"
								}`}
								onClick={(e) => {
									dispatch(closeAllMenus());

									if (!libraryMenuOpen || library != libraryForMenu) {
										dispatch(toggleLibraryMenu());
										dispatch(setLibraryForMenu(library));
										cm.current?.show(e);
									}
								}}
							>
								<VerticalDotsIcon />
							</a>
						</div>
					</button>
				))}
				<ContextMenu
					model={menuItems}
					ref={cm}
					className={`dropdown-menu ${
						libraryMenuOpen ? " dropdown-menu-open" : ""
					}`}
				/>
			</div>
		</>
	);
}

export default LibrariesList;
