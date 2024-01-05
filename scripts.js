function toggleCollapse(element) {
    const subSkills = element.querySelector('.sub-skills');
    element.classList.toggle("collapsed");
    subSkills.classList.toggle("active");
}
function navigateToPage(pageUrl) {
    // Redirect to the specified page
    window.location.href = pageUrl;
}
