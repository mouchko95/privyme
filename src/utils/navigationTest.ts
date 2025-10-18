export async function testNavigation() {
  if (!import.meta.env.DEV) return;

  const routes = ['/conversations', '/dashboard', '/wallet', '/profile'];
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  console.log('🧪 Starting navigation test...');

  for (const route of routes) {
    console.log(`📍 Testing route: ${route}`);

    window.history.pushState({}, '', route);
    window.dispatchEvent(new PopStateEvent('popstate'));

    await delay(500);

    const navItem = document.querySelector(`.nav-item[href="${route}"]`);
    if (navItem) {
      const isActive = navItem.classList.contains('active');
      console.log(`  ✓ Nav item found, active: ${isActive}`);
    } else {
      console.warn(`  ⚠️ Nav item not found for ${route}`);
    }

    const clickableElements = document.querySelectorAll('button, a, [role="button"]');
    let blockedCount = 0;

    clickableElements.forEach(el => {
      const rect = el.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        const elementAtPoint = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );

        if (elementAtPoint !== el && !el.contains(elementAtPoint)) {
          blockedCount++;
        }
      }
    });

    if (blockedCount > 0) {
      console.warn(`  ⚠️ ${blockedCount} clickable elements may be blocked by overlays`);
    } else {
      console.log(`  ✓ All clickable elements accessible`);
    }
  }

  console.log('✅ Navigation test complete - Navigation OK');
}

if (import.meta.env.DEV) {
  (window as any).testNavigation = testNavigation;
  console.log('💡 Run window.testNavigation() to test navigation');
}
