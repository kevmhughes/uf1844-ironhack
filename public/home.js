async function deleteImage(index) {
    const response = await fetch(`/images/${index}`, { method: 'DELETE' });
    if (response.ok) {
        location.reload();  // Reload the page to update the image list
    } else {
        alert('Failed to delete image.');
    }
}