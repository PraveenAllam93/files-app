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

    <ul class="list-disc pl-4">
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