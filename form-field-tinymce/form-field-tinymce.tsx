import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MediaItem } from '@/components/media-library';
import { InfoIcon } from 'lucide-react';
import { ComponentProps, useCallback, useRef } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useUploadsFile } from '@/hooks/use-uploads-files';
import { Editor } from '@tinymce/tinymce-react';
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';
import { toast } from 'sonner';

export type FormFieldEditor<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    onMediaPickerOpen: MediaPickerOpenHandler;
    formItemClassName?: string;
    formItemProps?: Omit<
        ComponentProps<'div'>,
        'name' | 'children' | 'className'
    >;
    required?: boolean;
    hint?: string;
} & Omit<
    ComponentProps<typeof Input>,
    'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref'
>;

export type MediaPickerOpenRequest = {
    multiselect: boolean;
    onMediaSelected: (selection: MediaItem[] | null) => void;
};

export type MediaPickerOpenHandler = (
    request: MediaPickerOpenRequest,
) => void;

export default function FormFieldTinyMce<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    onMediaPickerOpen,
    formItemClassName,
    formItemProps,
    required,
    hint,
}: FormFieldEditor<TFieldValues, TContext, TTransformedValues>) {
    type MediaSelectionCallback = (urls: string[]) => void;
    type FilePickerInsertCallback = (
        value: string,
        meta?: Record<string, unknown>,
    ) => void;
    type FilePickerCallback = (
        callback: FilePickerInsertCallback,
        value: string,
        meta: Record<string, unknown>,
    ) => void;
    type TinyMceEditor = {
        dom: {
            select(selector: string): Element[];
        };
        on(event: 'click', handler: (event: MouseEvent) => unknown): void;
        on(
            event: 'dragstart' | 'dragover' | 'drop',
            handler: (event: DragEvent) => unknown,
        ): void;
        on(event: string, handler: (event?: unknown) => unknown): void;
        undoManager: {
            add(): void;
        };
        setDirty(dirty: boolean): void;
        dispatch(event: string): void;
        insertContent(content: string): void;
        ui: {
            registry: {
                addMenuItem(
                    name: string,
                    config: {
                        text: string;
                        icon: string;
                        shortcut: string;
                        onAction: () => unknown;
                    },
                ): void;
                addButton(
                    name: string,
                    config: {
                        icon: string;
                        tooltip: string;
                        onAction: () => unknown;
                    },
                ): void;
                addIcon(name: string, svg: string): void;
            };
        };
        notificationManager: {
            open(config: { text: string; type: string; timeout: number }): void;
        };
        addShortcut(
            shortcut: string,
            description: string,
            callback: () => unknown,
        ): void;
    };

    const { uploadMedia } = useUploadsFile();

    const isPasting = useRef(false);

    const openMediaPicker = useCallback(
        (
            multiselect: boolean,
            onSelected: MediaSelectionCallback,
        ): void => {
            onMediaPickerOpen({
                multiselect,
                onMediaSelected: (selection) => {
                    const urls =
                        selection?.map((media) => media.original_url) ?? [];

                    if (urls.length > 0) {
                        onSelected(urls);
                    }
                },
            });
        },
        [onMediaPickerOpen],
    );

    const openFileManager = useCallback<FilePickerCallback>(
        (callback) => {
            openMediaPicker(false, (urls) => callback(urls[0]));
        },
        [openMediaPicker],
    );

    const editorConfig: InitOptions = {
        allow_script_urls: true,
        entity_encoding: 'raw',
        language: 'el',
        height: 1000,
        menubar: false,
        sandbox_iframes: false,
        mediaembed_max_width: 650,
        mediaembed_inline_styles: true,
        paste_data_images: false,
        automatic_uploads: false,
        paste_tab_spaces: 4,
        plugins: [
            'image media link code',
            'code',
            'codesample',
            'directionality',
            'advlist',
            'autolink',
            'link',
            'image',
            'editimage',
            'lists',
            'charmap',
            'preview',
            'anchor',
            'pagebreak',
            'searchreplace',
            'wordcount',
            'visualblocks',
            'visualchars',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'emoticons',
            'help',
            'powerpaste',
        ],
        contextmenu: 'link copy custompaste  cut',
        toolbar: [
            'ai_enhancer | code undo redo removeformat | formatselect fontsizeselect |' +
                ' styles | bold italic | rtl ltr ' +
                '| alignjustify alignright aligncenter alignleft ' +
                '| numlist bullist outdent indent accordion ' +
                '| forecolor backcolor | blockquote table toc hr ' +
                '| image insertMediaButton insertCarouselButton| link anchor media codesample emoticons ' +
                '| visualblocks preview wordcount fullscreen help editimage',
        ],
        toolbar_mode: 'wrap',
        file_picker_callback: openFileManager,
        toolbar_sticky: true,
        resize: true,
        image_caption: true,
        setup: (editor: TinyMceEditor) => {
            let draggedCarouselImage: HTMLImageElement | null = null;

            const syncCarouselImages = () => {
                editor.dom
                    .select('#carousel, [id^="carousel-"]')
                    .forEach((carousel: Element) => {
                        const imageUrls = Array.from(
                            carousel.querySelectorAll('img'),
                        )
                            .map((image) => image.getAttribute('src'))
                            .filter(
                                (url: string | null): url is string => !!url,
                            );

                        if (imageUrls.length === 0) {
                            carousel.remove();
                            return;
                        }

                        carousel.setAttribute(
                            'data-images',
                            JSON.stringify(imageUrls),
                        );
                    });
            };

            const getElement = (
                target: EventTarget | null,
            ): HTMLElement | null => {
                if (
                    !target ||
                    typeof (target as HTMLElement).closest !== 'function'
                )
                    return null;

                return target as HTMLElement;
            };

            const getCarouselPreview = (target: EventTarget | null) => {
                return (
                    getElement(target)?.closest(
                        '[data-carousel-images-preview="true"]',
                    ) ?? null
                );
            };

            const getPreviewImage = (
                target: EventTarget | null,
            ): HTMLImageElement | null => {
                const image = getElement(target)?.closest('img');

                return image?.tagName === 'IMG'
                    ? (image as HTMLImageElement)
                    : null;
            };

            editor.on('dragstart', (event: DragEvent) => {
                const target = getPreviewImage(event.target);
                const preview = getCarouselPreview(target);

                if (!target || !preview) return;

                draggedCarouselImage = target;
                event.dataTransfer?.setData('text/plain', 'carousel-image');
                if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = 'move';
                }
            });

            editor.on('dragover', (event: DragEvent) => {
                if (!draggedCarouselImage || !getCarouselPreview(event.target))
                    return;

                event.preventDefault();
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'move';
                }
            });

            editor.on('drop', (event: DragEvent) => {
                const preview = getCarouselPreview(event.target);
                if (!draggedCarouselImage || !preview) return;

                event.preventDefault();

                const target = getPreviewImage(event.target);
                if (target && target !== draggedCarouselImage) {
                    const targetBounds = target.getBoundingClientRect();
                    const insertAfterTarget =
                        event.clientX >
                        targetBounds.left + targetBounds.width / 2;

                    preview.insertBefore(
                        draggedCarouselImage,
                        insertAfterTarget ? target.nextSibling : target,
                    );
                } else {
                    preview.appendChild(draggedCarouselImage);
                }

                draggedCarouselImage = null;
                syncCarouselImages();
                editor.undoManager.add();
                editor.setDirty(true);
                editor.dispatch('change');
            });

            editor.on('click', (event: MouseEvent) => {
                const addImagesButton = getElement(event.target)?.closest(
                    '[data-carousel-add-images="true"]',
                );
                const carousel = addImagesButton?.closest(
                    '#carousel, [id^="carousel-"]',
                );
                const preview = carousel?.querySelector(
                    '[data-carousel-images-preview="true"]',
                );

                if (!carousel || !preview) return;

                event.preventDefault();
                openMediaPicker(true, (urls) => {
                    urls.forEach((url) => {
                        const image =
                            preview.ownerDocument.createElement('img');
                        image.src = url;
                        image.alt = '';
                        image.draggable = true;
                        image.style.cssText =
                            'width: 96px; height: 64px; object-fit: cover; border-radius: 4px; flex: 0 0 auto;';
                        preview.appendChild(image);
                    });

                    syncCarouselImages();
                    editor.undoManager.add();
                    editor.setDirty(true);
                    editor.dispatch('change');
                });
            });

            const uploadMediaForEditor = (file: File) => {
                uploadMedia(file, 'uploads')
                    .then((json) => {
                        const url = json.data.url;
                        editor.insertContent(
                            `<p><img src="${url}" alt="" /></p>`,
                        );
                    })
                    .catch((error) => {
                        console.error(error);
                        toast.error('Κάτι πήγε στραβά!');
                    });
            };

            editor.ui.registry.addMenuItem('custompaste', {
                text: 'Paste',
                icon: 'paste',
                shortcut: 'Meta+V',
                onAction: async () => {
                    await doCustomPaste();
                },
            });

            editor.ui.registry.addButton('insertMediaButton', {
                icon: 'gallery',
                tooltip: 'Προθήκη πολλαπλών εικόνων',
                onAction: () => {
                    openMediaPicker(true, (urls) => {
                        // Insert each image
                        const imagesHtml = urls
                            .map((url) => `<img alt="" src="${url}" />`)
                            .join('<br>');
                        editor.insertContent(imagesHtml);
                    });
                },
            });

            editor.ui.registry.addIcon(
                'gallery-horizontal',
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >' +
                    '<rect width="14" height="14" x="5" y="3" style="fill: none;"/>' +
                    '<circle cx="9" cy="7" r="1" style="fill: none;"/>' +
                    '<path d="m6 15 4-4 3 3 2-2 3 3" style="fill: none;"/>' +
                    '<path d="M4 21h1"/>' +
                    '<path d="M9 21h1"/>' +
                    '<path d="M14 21h1"/>' +
                    '<path d="M19 21h1"/>' +
                    '</svg>',
            );

            editor.ui.registry.addButton('insertCarouselButton', {
                icon: 'gallery-horizontal',
                tooltip: 'Προσθήκη carousel εικόνων',
                onAction: () => {
                    openMediaPicker(true, (urls) => {
                        const carouselNumbers = editor.dom
                            .select('[id^="carousel-"]')
                            .map(
                                (element: Element) =>
                                    Number(
                                        element.id.match(
                                            /^carousel-(\d+)$/,
                                        )?.[1],
                                    ) || 0,
                            );
                        const carouselId = `carousel-${Math.max(0, ...carouselNumbers) + 1}`;
                        const imageSources = JSON.stringify(urls)
                            .replace(/&/g, '&amp;')
                            .replace(/'/g, '&#39;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;');
                        const imagePreviews = urls
                            .map((url) => {
                                const safeUrl = url
                                    .replace(/&/g, '&amp;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;');

                                return `<img src="${safeUrl}" alt="" draggable="true" style="width: 96px; height: 64px; object-fit: cover; border-radius: 4px; flex: 0 0 auto;" />`;
                            })
                            .join('');

                        editor.insertContent(
                            `<p> </p>` +
                                `<div id="${carouselId}" data-images='${imageSources}' style="border: 2px solid #000000; padding: 2px;">` +
                                '<p><strong>Carousel Images</strong></p>' +
                                '<p style="color: #9ca3af; font-size: 13px; font-style: italic; "><em>Drag & Drop to reorder</em></p>' +
                                '<span data-carousel-images-preview="true" style="display: flex; gap: 8px; overflow-x: auto;">' +
                                '<span data-carousel-add-images="true" contenteditable="false" role="button" aria-label="Add carousel images" style="align-items: center; background: #f3f4f6; border: 1px dashed #9ca3af; border-radius: 4px; cursor: pointer; display: inline-flex; flex: 0 0 auto; font-size: 24px; height: 64px; justify-content: center; width: 64px;">+</span>' +
                                `${imagePreviews}</span>` +
                                '<p style="color: #b91c1c; font-size: 13px; font-style: italic; margin: 8px 0 0;"><em>Note: Do not add text inside this carousel area. Only images appear in the published carousel.</em></p>' +
                                '</div>' +
                                `<p> </p>`,
                        );
                    });
                },
            });

            async function doCustomPaste() {
                if (isPasting.current) {
                    return;
                }
                isPasting.current = true;
                try {
                    function escapeHtml(text: string) {
                        return text
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#39;');
                    }

                    function isSafeHref(href: string) {
                        try {
                            const url = new URL(href, window.location.href);
                            return [
                                'http:',
                                'https:',
                                'mailto:',
                                'tel:',
                            ].includes(url.protocol);
                        } catch {
                            return false;
                        }
                    }

                    function plainTextToHtml(text: string) {
                        const paras = text.split(/\n{2,}/).map((p) => {
                            const withBreaks = p.replace(/\r\n|\r|\n/g, '<br>');
                            return `<p>${withBreaks}</p>`;
                        });
                        return paras.join('');
                    }

                    const inlineAllowed = new Set([
                        'strong',
                        'b',
                        'em',
                        'i',
                        'u',
                    ]);
                    const blockAllowed = new Set([
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'h5',
                        'h6',
                        'iframe',
                        'p',
                        'ul',
                        'ol',
                        'li',
                        'blockquote',
                        'pre',
                        'code',
                        'br',
                    ]);

                    const uploadMediaUrl = async (
                        file: File,
                    ): Promise<string | null> => {
                        try {
                            const json = await uploadMedia(file, 'uploads');
                            return json?.data?.url || null;
                        } catch (err) {
                            console.error('upload failed', err);
                            toast.error('Κάτι πήγε στραβά!');

                            return null;
                        }
                    };

                    async function srcToFile(
                        src: string,
                    ): Promise<File | null> {
                        try {
                            if (src.startsWith('data:')) {
                                const res = await fetch(src);
                                const blob = await res.blob();
                                const mime = blob.type || 'image/png';
                                let extension = '';
                                if (mime === 'image/jpeg') {
                                    extension = '.jpg';
                                } else if (mime === 'image/png') {
                                    extension = '.png';
                                } else {
                                    const parts = mime.split('/');
                                    extension = parts[1]
                                        ? `.${parts[1].split(';')[0]}`
                                        : '';
                                }
                                return new File(
                                    [blob],
                                    `pasted-image${extension}`,
                                    { type: mime },
                                );
                            } else {
                                const res = await fetch(src, { mode: 'cors' });
                                if (!res.ok) {
                                    return null;
                                }
                                const contentType =
                                    res.headers.get('content-type') || '';
                                if (!contentType.startsWith('image/')) {
                                    return null;
                                }
                                const blob = await res.blob();
                                let extension = '';
                                if (contentType.includes('jpeg')) {
                                    extension = '.jpg';
                                } else if (contentType.includes('png')) {
                                    extension = '.png';
                                } else {
                                    const parts = contentType.split('/');
                                    extension = parts[1]
                                        ? `.${parts[1].split(';')[0]}`
                                        : '';
                                }
                                return new File(
                                    [blob],
                                    `pasted-image${extension}`,
                                    { type: contentType },
                                );
                            }
                        } catch (e) {
                            console.warn(
                                'failed to convert src to file',
                                src,
                                e,
                            );
                            return null;
                        }
                    }

                    async function processNode(
                        node: Node,
                    ): Promise<Node | null> {
                        if (node.nodeType === Node.TEXT_NODE) {
                            return document.createTextNode(
                                node.textContent || '',
                            );
                        }
                        if (node.nodeType !== Node.ELEMENT_NODE) {
                            return null;
                        }

                        const el = node as HTMLElement;
                        const tag = el.tagName.toLowerCase();

                        if (tag === 'a') {
                            const href = el.getAttribute('href') || '';
                            if (!isSafeHref(href)) {
                                const frag = document.createDocumentFragment();
                                for (const child of Array.from(el.childNodes)) {
                                    const processed = await processNode(child);
                                    if (processed) {
                                        frag.appendChild(processed);
                                    }
                                }
                                return frag as unknown as Node;
                            }
                            const a = document.createElement('a');
                            a.setAttribute('href', escapeHtml(href));
                            const target = el.getAttribute('target');
                            if (target) {
                                a.setAttribute('target', escapeHtml(target));
                                a.setAttribute('rel', 'noopener noreferrer');
                            }
                            for (const child of Array.from(el.childNodes)) {
                                const processed = await processNode(child);
                                if (processed) {
                                    a.appendChild(processed);
                                }
                            }
                            return a;
                        }

                        if (tag === 'img') {
                            const src = el.getAttribute('src') || '';
                            const alt = el.getAttribute('alt') || '';
                            if (!src) {
                                return null;
                            }

                            const imgEl = document.createElement('img');
                            imgEl.setAttribute('alt', alt);

                            const file = await srcToFile(src);
                            if (file) {
                                const uploadedUrl = await uploadMediaUrl(file);
                                if (uploadedUrl) {
                                    imgEl.setAttribute('src', uploadedUrl);
                                }
                            }
                            return imgEl;
                        }

                        if (tag === 'iframe') {
                            const src = el.getAttribute('src') || '';
                            const style = el.getAttribute('style') || '';

                            const tmp = document.createElement('div');
                            tmp.style.cssText = style;
                            const heightValue = tmp.style.height;

                            const iframeEl = document.createElement('iframe');
                            iframeEl.setAttribute('src', src);
                            iframeEl.setAttribute('scrolling', 'no');
                            iframeEl.setAttribute('frameborder', '0');
                            iframeEl.setAttribute('allowfullscreen', 'true');

                            iframeEl.style.cssText = style;

                            if (heightValue) {
                                iframeEl.setAttribute('height', heightValue);
                            }

                            return iframeEl;
                        }

                        if (blockAllowed.has(tag) || inlineAllowed.has(tag)) {
                            const newEl = document.createElement(tag);
                            for (const child of Array.from(el.childNodes)) {
                                const processed = await processNode(child);
                                if (processed) {
                                    newEl.appendChild(processed);
                                }
                            }
                            if (tag === 'br') {
                                return document.createElement('p');
                            }
                            return newEl;
                        }

                        const frag = document.createDocumentFragment();
                        for (const child of Array.from(el.childNodes)) {
                            const processed = await processNode(child);
                            if (processed) {
                                frag.appendChild(processed);
                            }
                        }
                        return frag as unknown as Node;
                    }

                    let rawContent = '';
                    try {
                        if (
                            navigator.clipboard &&
                            (navigator.clipboard as any).read
                        ) {
                            const items = await (
                                navigator.clipboard as any
                            ).read();
                            for (const item of items) {
                                if (
                                    item.types &&
                                    item.types.includes('text/html')
                                ) {
                                    const blob =
                                        await item.getType('text/html');
                                    rawContent = await blob.text();
                                    break;
                                }
                            }
                        }
                        if (!rawContent) {
                            const text = await navigator.clipboard.readText();
                            rawContent = plainTextToHtml(text);
                        }
                    } catch {
                        try {
                            const text = await navigator.clipboard.readText();
                            rawContent = plainTextToHtml(text);
                        } catch {
                            editor.notificationManager.open({
                                text: 'Clipboard access denied or unavailable. Use native paste (Ctrl+V / ⌘+V).',
                                type: 'error',
                                timeout: 4000,
                            });
                            return;
                        }
                    }

                    const parser = new DOMParser();
                    const doc = parser.parseFromString(rawContent, 'text/html');

                    const frag = document.createDocumentFragment();
                    for (const child of Array.from(doc.body.childNodes)) {
                        const processed = await processNode(child);
                        if (processed) {
                            frag.appendChild(processed);
                        }
                    }

                    const container = document.createElement('div');
                    container.appendChild(frag);
                    editor.insertContent(container.innerHTML);
                } finally {
                    isPasting.current = false;
                }
            }

            editor.on('SkinLoaded', () => {
                const dialogs = document.querySelectorAll(
                    '.tox-tinymce-aux, .tox-dialog, .tox-dialog__backdrop',
                );
                dialogs.forEach((dialog) => {
                    (dialog as HTMLElement).style.zIndex = '10';
                });
            });

            editor.addShortcut('Meta+V', 'Custom Paste', async () => {
                await doCustomPaste();
            });

            editor.on('drop', (event) => {
                const dragEvent = event as unknown as DragEvent;
                const dt = dragEvent.dataTransfer;
                if (!dt || !dt.files || dt.files.length === 0) return;
                const files = Array.from(dt.files).filter((file) =>
                    file.type.startsWith('image/'),
                );
                files.forEach((file) => {
                    dragEvent.preventDefault();
                    uploadMediaForEditor(file);
                });
            });

            editor.on('input change undo redo', syncCarouselImages);
        },
    };

    const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;

    return (
        <>
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem {...formItemProps} className={formItemClassName}>
                        {hint ? (
                            <div className="flex items-center gap-1.5">
                                <FormLabel required={required}>
                                    {label}
                                </FormLabel>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label={hint}
                                            className="text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            <InfoIcon className="size-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{hint}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ) : (
                            <FormLabel required={required}>{label}</FormLabel>
                        )}
                        <FormControl>
                            <Editor
                                apiKey={apiKey}
                                value={field.value ?? ''}
                                onEditorChange={field.onChange}
                                onBlur={field.onBlur}
                                init={editorConfig}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
