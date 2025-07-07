<script lang=ts">
    let selectedFiles: File[] = [];
    let uploadResults: string[] = [];

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const MAX_UPLOADS_SIZE = 10 * 1024 * 1024; // 10 MB
    const MAX_FILES = 3;

    const SUPPORTED_FILE_TYPES = [
        'image/jpeg',
        'image/png',
    ];

    function handleFiles(files: FileList | null) {
        if (!files) return;

        let totalSize = 0;
        uploadResults = [];
        selectedFiles = [];
        
        if (files.length > MAX_FILES) {
            uploadResults.push(`You can only upload up to ${MAX_FILES} files.`);
            return;
        }
        
        for (const file of files) {
            if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
                uploadResults.push(`${file.name}: unsupported file type.`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                uploadResults.push(`${file.name}: too large.`);
                continue;
            }

            totalSize += file.size;
            if (totalSize > MAX_UPLOADS_SIZE) {
                uploadResults.push(`${file.name}: Total upload size exceeded`)
                continue;
            }

            selectedFiles.push(file);
            uploadResults.push(`${file.name}: ready to upload`)
        }
    }

    async function uploadFiles() {
        if (selectedFiles.length === 0) {
            uploadResults.push("No files selected for upload.");
            return;
        }

        const payload = {
            userid: "user_23y489ruhsbdfjbsof",
            files: selectedFiles.map(file => ({
                filename: file.name,
                content_type: file.type,
            }))
        };

        const response = await fetch('http://localhost:8000/file/put_presigned_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            uploadResults.push("Failed to get presigned URLs for upload.");
            return;
        }

        const data = await response.json();
        const urls: string[] = data.urls;
        const object_paths: string[] = data.object_paths;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const url = urls[i];

            try {
                const uploadResponse = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type,
                    },
                    body: file,
                });

                if (uploadResponse.ok) {
                    uploadResults[i] = `${file.name}: uploaded successfully at ${object_paths[i]}`;
                } else {
                    uploadResults[i] = `${file.name}: failed to upload.`;
                }
            } catch (error) {
                uploadResults[i] = `${file.name}: error during upload.`;
            }
        }

        await ingest_event(object_paths);
    }

    
    async function ingest_event(object_paths: string[]) {
        if (uploadResults.length === 0) {
            uploadResults.push("No files uploaded yet.");
            return;
        }

        const payload = {
            userid: "user_23y489ruhsbdfjbsof",
            files: selectedFiles.map((file, i) => ({
                filename: file.name,
                content_type: file.type,
                storage_path: object_paths[i]
            }))
        };

        try {
            const response = await fetch("http://localhost:8000/file/ingest_event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                uploadResults.push("Files ingested successfully.");
            } else {
                uploadResults.push("Failed to ingest files.");
            }
        } catch (error) {
            uploadResults.push("Error during ingestion.");
            console.error(error);
        }
    }
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Upload Images</h1>

	<input
		type="file"
		accept="image/png,image/jpeg"
		multiple
        on:change={(e) => handleFiles((e.target as HTMLInputElement)?.files)}
		class="mb-4 block"
	/>

    <button
        on:click={uploadFiles}
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Upload Selected Files
    </button>

    <ul class="list-disc pl-4 mt-4">
		{#each uploadResults as result}
			<li>{result}</li>
		{/each}
	</ul>

	{#if selectedFiles.length}
		<h2 class="mt-6 text-xl font-semibold">Selected File Info</h2>
		<ul class="mt-2 space-y-2">
			{#each selectedFiles as file}
				<li class="bg-gray-100 p-2 rounded">
					<strong>{file.name}</strong><br />
					Type: {file.type}<br />
					Size: {(file.size / 1024).toFixed(2)} KB
				</li>
			{/each}
		</ul>
	{/if}
</div>