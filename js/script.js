let scene, camera, renderer, mixer, clock;

init();
window.addEventListener("resize", updateSize);
let object;

function init() {
	scene = new THREE.Scene();
	const container = document.getElementById("scene-container");

	// Renderer
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setClearColor(0x000000, 0); // Clear color with transparency
	container.appendChild(renderer.domElement);

	// Load the GLTF/GLB model
	const loader = new THREE.GLTFLoader();
	loader.load("./macbook.glb", (gltf) => {
		object = gltf.scene;
		scene.add(object);

		// Use the first camera found in the GLTF model
		camera = gltf.cameras[0];

		if (!camera) {
			console.error("GLTF model does not contain a camera.");
			// Fallback camera if the model does not include one
			camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
			camera.position.set(0, 1, 2);
			//zoom out camera a bit
		}

		updateSize(gltf); // Set initial size and update projection

		// Add lights
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(0, 1, 0);
		scene.add(directionalLight);

		animate();
		ScrollTrigger.refresh(true);
	});

	// Clock for animation updates
	clock = new THREE.Clock();
}

function updateSize(gltf) {
	const container = document.getElementById("scene-container");
	//make the canvas position relative
	renderer.domElement.style.position = "relative";
	//translate the canvas to the center
	renderer.domElement.style.left = "50%";
	renderer.domElement.style.transform = "translateX(-50%)";

	let width = container.clientWidth;
	// const height = container.clientHeight;

	//if width is less than 800, set it to 800
	if (width < 600) {
		width = 600;
	}

	//have a 16:9 aspect ratio. based from the width, calculate the height
	const aspect = 16 / 9;
	let height = width / aspect;

	//adjust the height so the model fits in the screen
	renderer.setSize(width, height);

	if (camera) {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		// Optionally adjust camera settings
	}

	//refresh the scroll trigger
	setupScrollAnimation();
}

function updatePinSpacerHeight() {
	const scrollTriggerInstance = ScrollTrigger.getById("animate-screen"); // Ensure you set an ID in your ScrollTrigger creation
	if (scrollTriggerInstance && scrollTriggerInstance.pinSpacer) {
		const newHeight = document.getElementById("animate-screen").offsetHeight + "px"; // Calculate new height based on the content
		scrollTriggerInstance.pinSpacer.style.height = newHeight;
		console.log("Updated pin-spacer height to:", newHeight);
	}

	console.log(scrollTriggerInstance);
	ScrollTrigger.refresh(); // Refresh ScrollTrigger to apply changes
}

// function animate() {
// 	requestAnimationFrame(animate);
// 	const delta = clock.getDelta();
// 	if (mixer) mixer.update(delta * 0.8);
// 	renderer.render(scene, camera);
// }

function animate() {
	requestAnimationFrame(animate); // Continue the animation loop
	const delta = clock.getDelta();
	if (mixer) {
		mixer.update(delta * 0.8); // Update any animations from GLTF
	}
	renderer.render(scene, camera); // Re-render the scene
}

function setupScrollAnimation() {
	gsap.registerPlugin(ScrollTrigger);

	// Ensure the object is ready
	if (!object) {
		console.error("Object is not defined.");
		return;
	}

	// ScrollTrigger to modify the object's rotation based on scroll
	let instance = ScrollTrigger.create({
		trigger: "#animate-screen",
		start: "top 10%",
		end: "bottom 50%", // Extend the end point to ensure a longer scroll
		scrub: true, // Use true for smoother scrubbing, or adjust the number for timing
		pin: true, // Ensure pinning is working as expected
		pinSpacing: false, // Disable automatic pin spacing
		onRefresh: (self) => {
			// Adjust the spacer whenever ScrollTrigger refreshes
			const pinSpacer = self.pinSpacer;

			//log the height of the animate screen
			console.log(self.trigger.clientHeight);
			if (pinSpacer) {
				const newHeight = `${self.trigger.clientHeight}px`;
				pinSpacer.style.height = newHeight;
				console.log("Updated pin-spacer height to:", newHeight);
			}

			console.log(self.trigger.clientHeight);
		},
		onUpdate: (self) => {
			let screen = object.children[1].children[9]; // Ensure this is the correct reference to your object
			// Calculate the rotation from 0 to 1.745 radians
			const rotationProgress = self.progress * 2.15; // Max rotation in radians
			screen.rotation.x = -rotationProgress;

			//move the camera up

			if (self.progress <= 0.8) {
				// Assuming the initial y position is 1, interpolate to 2.5863671572424476
				camera.position.y = 1 + (self.progress / 0.85) * (2.4 - 1);
			} else {
				camera.position.y = 2.4; // Lock the position after 30% progress
			}
		},
	});
}

function toggleSidebar() {
	// Check if the screen is smaller than the medium breakpoint where the burger icon is visible
	if (window.innerWidth < 768) {
		// Adjust 768px according to your Tailwind's md breakpoint
		const sidebar = document.getElementById("sidebar");
		sidebar.classList.toggle("translate-x-[-100%]");
		sidebar.classList.toggle("translate-x-0");
	}
}

document.addEventListener("DOMContentLoaded", function () {
	const sidebarLinks = document.querySelectorAll("#sidebar a");
	sidebarLinks.forEach((link) => {
		link.addEventListener("click", function () {
			if (window.innerWidth < 768) {
				// This ensures that the function only triggers under your responsive condition
				closeSidebar();
			}
		});
	});
});

function closeSidebar() {
	const sidebar = document.getElementById("sidebar");
	if (sidebar.classList.contains("translate-x-0")) {
		sidebar.classList.remove("translate-x-0");
		sidebar.classList.add("translate-x-[-100%]");
	}
}

//track the scrolling, if its past 200px, add this class to nav
window.addEventListener("scroll", function () {
	const nav = document.getElementById("main-nav"); // Get the nav element
	if (window.scrollY > 100) {
		// Check if the scroll is more than 100px
		nav.classList.add("bg-[#0E0E0E]"); // Add the class if scrolled past 100px
	} else {
		nav.classList.remove("bg-[#0E0E0E]"); // Remove the class if not
	}
});

const carouselContainer = document.querySelector(".carousel-container");

let scrollAmount = 0;
const scrollSpeed = 2; // Adjust this value to change the scroll speed

function scrollCarousel() {
	scrollAmount += scrollSpeed;
	carouselContainer.scrollLeft = scrollAmount;

	if (scrollAmount >= carouselContainer.scrollWidth / 2) {
		scrollAmount = 0;
	}

	requestAnimationFrame(scrollCarousel);
}

scrollCarousel();
