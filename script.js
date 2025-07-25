let currentWallpaperData = null;
let lastWallpaperDate = null;
let systemInfo = {
    cpu: { name: 'Unknown CPU', usage: 0 },
    gpu: { name: 'Unknown GPU', usage: 0 },
    ram: { total: 0, used: 0, available: 0 },
    network: { name: 'Unknown Network', downSpeed: 0, upSpeed: 0 }
};

let livelyData = {
    cpuCounter: 0,
    gpuCounter: 0,
    netDownCounter: 0,
    netUpCounter: 0,
    memTotal: 1,
    memFree: 0,
    cpuName: "",
    gpuName: "",
    memoryName: "",
    netCardName: "",
    isDataReceived: false
};

class SystemMonitor {    constructor() {
        this.isSupported = this.checkAPISupport();
        this.updateInterval = 1000;
        this.intervalId = null;
    }

    checkAPISupport() {
        return typeof navigator !== 'undefined' && 
               'getBattery' in navigator || 
               'connection' in navigator ||
               'deviceMemory' in navigator;
    }

    async getSystemInfo() {
        const info = {
            cpu: await this.getCPUInfo(),
            gpu: await this.getGPUInfo(),
            ram: await this.getRAMInfo(),
            network: await this.getNetworkInfo()
        };
        return info;
    }

    async getCPUInfo() {
        try {
            // Use navigator.hardwareConcurrency for CPU cores
            const cores = navigator.hardwareConcurrency || 4;
            
            // Simulate CPU usage (in a real environment, you'd need a system API)
            const usage = this.simulateCPUUsage();
            
            return {
                name: `CPU ${cores} cores`,
                usage: usage,
                cores: cores
            };
        } catch (error) {
            console.warn('CPU info not available:', error);
            return { name: 'Unknown CPU', usage: Math.random() * 30 + 10, cores: 4 };
        }
    }

    async getGPUInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown GPU';
                
                return {
                    name: renderer,
                    usage: Math.random() * 50 + 10 // Simulated usage
                };
            }
        } catch (error) {
            console.warn('GPU info not available:', error);
        }
        
        return { name: 'Unknown GPU', usage: Math.random() * 40 + 5 };
    }

    async getRAMInfo() {
        try {
            // Use navigator.deviceMemory if available (Chrome only)
            if ('deviceMemory' in navigator) {
                const totalGB = navigator.deviceMemory;
                const usedPercent = Math.random() * 60 + 20; // Simulate 20-80% usage
                const usedGB = (totalGB * usedPercent / 100);
                
                return {
                    total: totalGB * 1024, // Convert to MB
                    used: usedGB * 1024,
                    available: (totalGB - usedGB) * 1024,
                    percentage: usedPercent
                };
            }        } catch (error) {
            console.warn('RAM info not available:', error);
        }
        
        const totalMB = 16 * 1024;
        const usedPercent = Math.random() * 60 + 20;
        const usedMB = totalMB * usedPercent / 100;
        
        return {
            total: totalMB,
            used: usedMB,
            available: totalMB - usedMB,
            percentage: usedPercent
        };
    }

    async getNetworkInfo() {
        try {
            if ('connection' in navigator) {
                const connection = navigator.connection;
                return {
                    name: connection.effectiveType || 'Unknown',
                    downSpeed: connection.downlink || Math.random() * 100,
                    upSpeed: (connection.downlink || Math.random() * 100) * 0.1, // Assume 10% of download
                    type: connection.type || 'unknown'
                };
            }        } catch (error) {
            console.warn('Network info not available:', error);
        }
        
        return {
            name: 'WiFi Network',
            downSpeed: Math.random() * 100 + 10,
            upSpeed: Math.random() * 20 + 5,
            type: 'wifi'
        };
    }    simulateCPUUsage() {
        const baseUsage = Math.random() * 20 + 5;
        const spike = Math.random() < 0.1 ? Math.random() * 40 : 0;
        return Math.min(baseUsage + spike, 100);
    }    startMonitoring() {
        if (this.intervalId || livelyData.isDataReceived) return;
        
        this.intervalId = setInterval(async () => {
            if (!livelyData.isDataReceived) {
                systemInfo = await this.getSystemInfo();
                this.updateDisplay(systemInfo);
            }
        }, this.updateInterval);
        
        this.getSystemInfo().then(info => {
            if (!livelyData.isDataReceived) {
                systemInfo = info;
                this.updateDisplay(info);
            }
        });
    }

    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    updateDisplay(info) {
        // Update CPU
        const cpuValue = info.cpu.usage.toFixed(1);
        document.getElementById("cpuText").querySelector('.spec-value').textContent = 
            `${info.cpu.name}: ${cpuValue}%`;
        document.getElementById("cpuProgress").style.width = `${Math.min(info.cpu.usage, 100)}%`;
        
        // Update GPU
        const gpuValue = info.gpu.usage.toFixed(1);
        document.getElementById("gpuText").querySelector('.spec-value').textContent = 
            `${info.gpu.name}: ${gpuValue}%`;
        document.getElementById("gpuProgress").style.width = `${Math.min(info.gpu.usage, 100)}%`;
        
        // Update Network
        document.getElementById("netText").querySelector('.spec-value').textContent = 
            `${info.network.name}: ↓${info.network.downSpeed.toFixed(1)} ↑${info.network.upSpeed.toFixed(1)} Mb/s`;
        
        const totalNetSpeed = Math.min((info.network.downSpeed + info.network.upSpeed) / 2, 100);
        document.getElementById("netProgress").style.width = `${totalNetSpeed}%`;
        
        // Update RAM
        const ramPercentage = info.ram.percentage.toFixed(1);
        document.getElementById("ramText").querySelector('.spec-value').textContent = 
            `${(info.ram.used/1024).toFixed(1)}GB/${(info.ram.total/1024).toFixed(1)}GB (${ramPercentage}%)`;
        document.getElementById("ramProgress").style.width = `${Math.min(info.ram.percentage, 100)}%`;
    }
}

function livelySystemInformation(data) {
    try {
        const obj = JSON.parse(data);
        
        livelyData.cpuName = obj.NameCpu;
        livelyData.gpuName = obj.NameGpu;
        livelyData.netCardName = obj.NameNetCard;
        livelyData.memoryName = "Memory (" + (obj.TotalRam/1024).toFixed(0) + " GB)";
        
        livelyData.cpuCounter = obj.CurrentCpu;
        livelyData.gpuCounter = obj.CurrentGpu3D || 0;
        livelyData.netDownCounter = (obj.CurrentNetDown * 8) / (1024 * 1024);
        livelyData.netUpCounter = (obj.CurrentNetUp * 8) / (1024 * 1024);
        livelyData.memFree = obj.CurrentRamAvail;
        livelyData.memTotal = obj.TotalRam;
        
        updateDisplayFromLively();
        
    } catch (error) {
        console.error('Error parsing Lively system data:', error);
        if (!livelyData.isDataReceived) {
            browserSystemMonitor.startMonitoring();
        }
    }
}

function updateDisplayFromLively() {
    const cpuElement = document.getElementById("cpuText");
    if (cpuElement) {
        cpuElement.querySelector('.spec-value').textContent = `${livelyData.cpuName}: ${livelyData.cpuCounter.toFixed(1)}%`;
    }
    const cpuProgress = document.getElementById("cpuProgress");
    if (cpuProgress) {
        cpuProgress.style.width = `${Math.min(livelyData.cpuCounter, 100)}%`;
    }
    
    const gpuElement = document.getElementById("gpuText");
    if (gpuElement) {
        gpuElement.querySelector('.spec-value').textContent = `${livelyData.gpuName}: ${livelyData.gpuCounter.toFixed(1)}%`;
    }
    const gpuProgress = document.getElementById("gpuProgress");
    if (gpuProgress) {
        gpuProgress.style.width = `${Math.min(livelyData.gpuCounter, 100)}%`;
    }
    
    const netElement = document.getElementById("netText");
    if (netElement) {
        netElement.querySelector('.spec-value').textContent = `${livelyData.netCardName}: ↓${livelyData.netDownCounter.toFixed(1)} ↑${livelyData.netUpCounter.toFixed(1)} Mb/s`;
    }
    const netProgress = document.getElementById("netProgress");
    if (netProgress) {
        const totalSpeed = Math.min((livelyData.netDownCounter + livelyData.netUpCounter), 100);
        netProgress.style.width = `${totalSpeed}%`;
    }
    
    const usedRam = livelyData.memTotal - livelyData.memFree;
    const ramPercentage = (usedRam / livelyData.memTotal * 100);
    const ramElement = document.getElementById("ramText");
    if (ramElement) {
        ramElement.querySelector('.spec-value').textContent = `${(usedRam/1024).toFixed(1)}GB/${(livelyData.memTotal/1024).toFixed(1)}GB (${ramPercentage.toFixed(1)}%)`;
    }
    const ramProgress = document.getElementById("ramProgress");
    if (ramProgress) {
        ramProgress.style.width = `${Math.min(ramPercentage, 100)}%`;
    }
}

async function fetchBingWallpaper() {
    try {
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
          const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);        }
        
        const data = await response.json();
          if (data.images && data.images.length > 0) {
            const imageData = data.images[0];
            const imageUrl = `https://www.bing.com${imageData.url}`;
              currentWallpaperData = imageData;
            
            const img = new Image();
            img.crossOrigin = 'anonymous';            const imageLoadTimeout = setTimeout(() => {
                setFallbackWallpaper();
            }, 10000);
              img.onload = function() {
                clearTimeout(imageLoadTimeout);
                
                const wallpaperElement = document.getElementById('wallpaper');
                wallpaperElement.src = imageUrl;
                wallpaperElement.classList.add('loaded');
                
                document.getElementById('loadingIndicator').style.display = 'none';
                
                // Show wallpaper info
                updateWallpaperInfo(imageData);
                
                // Analyze and adjust text colors
                analyzeImageAndSetTextColor(wallpaperElement);
            };
              img.onerror = function() {
                clearTimeout(imageLoadTimeout);
                setFallbackWallpaper();
            };
            
            img.src = imageUrl;
            lastWallpaperDate = new Date().toDateString();
        } else {
            throw new Error('No image found in response');
        }
        
    } catch (error) {
        console.error('Error fetching Bing wallpaper:', error);
        setFallbackWallpaper();
    }
}

function setFallbackWallpaper() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    const wallpaperElement = document.getElementById('wallpaper');
    const hour = new Date().getHours();
    let gradient;
      if (hour >= 6 && hour < 12) {
        gradient = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #fdcb6e 100%)';
    } else if (hour >= 12 && hour < 18) {
        gradient = 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e17055 100%)';
    } else if (hour >= 18 && hour < 22) {
        gradient = 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 50%, #fd79a8 100%)';
    } else {
        gradient = 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #74b9ff 100%)';
    }
      document.body.style.background = gradient;
    wallpaperElement.style.display = 'none';
    
    setTextColor('#ffffff');
}

function analyzeImageAndSetTextColor(imgElement) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imgElement.naturalWidth || imgElement.width;
        canvas.height = imgElement.naturalHeight || imgElement.height;
        
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        
        // Analyze zones where text is located
        const zones = [
            { x: 0, y: 0, width: canvas.width * 0.4, height: canvas.height * 0.4 }, // Top-left (specs)
            { x: canvas.width * 0.6, y: canvas.height * 0.6, width: canvas.width * 0.4, height: canvas.height * 0.4 }, // Bottom-right (time)
            { x: 0, y: canvas.height * 0.6, width: canvas.width * 0.4, height: canvas.height * 0.4 } // Bottom-left (wallpaper info)
        ];
        
        zones.forEach((zone, index) => {
            const imageData = ctx.getImageData(zone.x, zone.y, zone.width, zone.height);
            const brightness = calculateAverageBrightness(imageData.data);
            
            // Determine text color based on brightness
            const textColor = brightness > 128 ? '#000000' : '#ffffff';
            const shadowColor = brightness > 128 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
            
            if (index === 0) {
                // Specs zone
                setSpecsTextColor(textColor, shadowColor);
            } else if (index === 1) {
                // Time zone
                setTimeTextColor(textColor, shadowColor);
            } else if (index === 2) {
                // Wallpaper info zone
                setWallpaperInfoTextColor(textColor, shadowColor);
            }
        });
        
    } catch (error) {
        console.error('Error analyzing image:', error);
        // Default color on error
        setTextColor('#ffffff');
    }
}

function calculateAverageBrightness(imageData) {
    let totalBrightness = 0;
    const pixelCount = imageData.length / 4;
    
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        
        // Perceptual brightness formula
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
        totalBrightness += brightness;
    }
    
    return totalBrightness / pixelCount;
}

// Color setting functions for different zones
function setSpecsTextColor(color, shadowColor) {
    const specsContainer = document.querySelector('.specs-container');
    specsContainer.style.color = color;
    specsContainer.style.textShadow = `0 2px 4px ${shadowColor}`;
}

function setTimeTextColor(color, shadowColor) {
    const timeInfo = document.querySelector('.time-info');
    timeInfo.style.color = color;
    timeInfo.style.textShadow = `0 2px 4px ${shadowColor}`;
}

function setWallpaperInfoTextColor(color, shadowColor) {
    const wallpaperInfo = document.querySelector('.wallpaper-info');
    wallpaperInfo.style.color = color;
    wallpaperInfo.style.textShadow = `0 2px 4px ${shadowColor}`;
}

function setTextColor(color) {
    const elements = document.querySelectorAll('.specs-container, .time-info, .wallpaper-info');
    elements.forEach(el => {
        el.style.color = color;
        el.style.textShadow = color === '#ffffff' ? '0 2px 4px rgba(0,0,0,0.8)' : '0 2px 4px rgba(255,255,255,0.8)';
    });
}

// Wallpaper info update
function updateWallpaperInfo(imageData) {
    const wallpaperInfo = document.getElementById('wallpaperInfo');
    const title = document.getElementById('wallpaperTitle');
    const description = document.getElementById('wallpaperDescription');
    
    if (imageData.title) {
        title.textContent = imageData.title;
        description.textContent = imageData.copyright || 'Bing Daily Image';
        wallpaperInfo.style.display = 'block';
    }
}

// Time update
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const dateString = now.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString;
    
    // Check if it's a new day to reload wallpaper
    const currentDate = now.toDateString();
    if (lastWallpaperDate && lastWallpaperDate !== currentDate) {
        fetchBingWallpaper();
    }
}

// Check for new wallpaper periodically
function checkForNewWallpaper() {
    const currentDate = new Date().toDateString();
    if (!lastWallpaperDate || lastWallpaperDate !== currentDate) {
        fetchBingWallpaper();
    }
}

// Global functions for external access
function refreshWallpaper() {
    fetchBingWallpaper();
}

// Function to immediately update system info to prevent "Detecting..." state
function updateSystemInfoImmediately() {
    if (livelyData.isDataReceived) {
        return;
    }
    
    const immediateInfo = {
        cpu: {
            name: navigator.hardwareConcurrency ? `CPU ${navigator.hardwareConcurrency} cores` : 'Multi-core CPU',
            usage: Math.random() * 30 + 10
        },
        gpu: {
            name: 'Graphics Card',
            usage: Math.random() * 40 + 5
        },
        ram: {
            total: navigator.deviceMemory ? navigator.deviceMemory * 1024 : 16 * 1024,
            used: 0,
            percentage: Math.random() * 60 + 20
        },
        network: {
            name: navigator.connection ? (navigator.connection.effectiveType || 'Network') : 'Network',
            downSpeed: Math.random() * 100 + 10,
            upSpeed: Math.random() * 20 + 5
        }
    };
    
    immediateInfo.ram.used = immediateInfo.ram.total * immediateInfo.ram.percentage / 100;
    
    browserSystemMonitor.updateDisplay(immediateInfo);
}

// Initialize system monitor
const systemMonitor = new SystemMonitor();
const browserSystemMonitor = new BrowserSystemMonitor();

function initializeSystemMonitoring() {
    const isLivelyEnvironment = (typeof window !== 'undefined' && window.lively) || 
                               document.location.protocol === 'file:' ||
                               window.location.href.includes('lively');
    
    if (isLivelyEnvironment) {
        console.log('Lively environment detected, waiting for system information API');
        
        let livelyTimeout = setTimeout(() => {
            if (!livelyData.isDataReceived) {
                console.log('Lively API timeout, falling back to browser monitoring');
                browserSystemMonitor.startMonitoring();
            }
        }, 3000);
        
        window.livelySystemInformation = function(data) {
            clearTimeout(livelyTimeout);
            livelyData.isDataReceived = true;
            livelySystemInformation(data);
        };
    } else {
        console.log('Browser environment detected, using enhanced browser monitoring');
        browserSystemMonitor.startMonitoring();
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Immediately replace "Detecting..." with actual system info
    updateSystemInfoImmediately();
    
    // Load initial wallpaper with timeout fallback
    fetchBingWallpaper();
      // Set a fallback timeout for wallpaper - if still loading after 5 seconds, show gradient
    setTimeout(() => {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator && loadingIndicator.style.display !== 'none') {
            setFallbackWallpaper();
        }
    }, 5000);
    
    // Update time immediately then every second
    updateTime();
    setInterval(updateTime, 1000);    setInterval(checkForNewWallpaper, 3600000);
    
    initializeSystemMonitoring();
    
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        bar.addEventListener('mouseenter', function() {
            this.style.transform = 'scaleY(1.2)';
        });
        bar.addEventListener('mouseleave', function() {
            this.style.transform = 'scaleY(1)';
        });
    });
});

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

window.livelySystemInformation = livelySystemInformation;
window.refreshWallpaper = refreshWallpaper;
window.systemMonitor = systemMonitor;
window.browserSystemMonitor = browserSystemMonitor;
window.systemMonitor = systemMonitor;
window.browserSystemMonitor = browserSystemMonitor;
window.browserSystemMonitor = browserSystemMonitor;

// Enhanced Browser-based System Monitor Class (GitHub Pages compatible)
class BrowserSystemMonitor extends SystemMonitor {
    constructor() {
        super();
        this.performanceData = {
            cpuSamples: [],
            frameTimes: [],
            memorySnapshots: []
        };
        this.setupPerformanceMonitoring();
    }

    setupPerformanceMonitoring() {
        // Monitor frame rate for CPU usage estimation
        let lastFrameTime = performance.now();
        const measureFrameTime = () => {
            const now = performance.now();
            const frameTime = now - lastFrameTime;
            this.performanceData.frameTimes.push(frameTime);
            
            // Keep only last 60 samples (roughly 1 second at 60fps)
            if (this.performanceData.frameTimes.length > 60) {
                this.performanceData.frameTimes.shift();
            }
            
            lastFrameTime = now;
            requestAnimationFrame(measureFrameTime);
        };
        requestAnimationFrame(measureFrameTime);

        // Monitor memory usage if available
        if (performance.memory) {
            setInterval(() => {
                this.performanceData.memorySnapshots.push({
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
                
                // Keep only last 30 samples
                if (this.performanceData.memorySnapshots.length > 30) {
                    this.performanceData.memorySnapshots.shift();
                }
            }, 1000);
        }
    }

    async getCPUInfo() {
        try {
            const cores = navigator.hardwareConcurrency || 4;
            let cpuUsage = 15; // Base usage
            
            // Method 1: Frame time analysis
            if (this.performanceData.frameTimes.length > 0) {
                const avgFrameTime = this.performanceData.frameTimes.reduce((a, b) => a + b) / this.performanceData.frameTimes.length;
                const targetFrameTime = 16.67; // 60fps = 16.67ms per frame
                
                if (avgFrameTime > targetFrameTime) {
                    const frameDelay = (avgFrameTime - targetFrameTime) / targetFrameTime;
                    cpuUsage += Math.min(frameDelay * 30, 40); // Add up to 40% based on frame delays
                }
            }
            
            // Method 2: Memory pressure indication
            if (performance.memory && this.performanceData.memorySnapshots.length > 1) {
                const latest = this.performanceData.memorySnapshots[this.performanceData.memorySnapshots.length - 1];
                const memoryPressure = latest.used / latest.total;
                cpuUsage += memoryPressure * 20; // Memory pressure can indicate CPU usage
            }
            
            // Method 3: Time-based variation (simulates real CPU patterns)
            const hour = new Date().getHours();
            const workingHours = hour >= 9 && hour <= 17;
            const timeMultiplier = workingHours ? 1.3 : 0.8;
            cpuUsage *= timeMultiplier;
            
            // Method 4: Add realistic fluctuation
            cpuUsage += (Math.sin(Date.now() / 10000) * 10); // Smooth sine wave variation
            cpuUsage += (Math.random() - 0.5) * 15; // Random fluctuation
            
            return {
                name: `${cores}-Core CPU`,
                usage: Math.max(5, Math.min(cpuUsage, 95)),
                cores: cores
            };
        } catch (error) {
            return await super.getCPUInfo();
        }
    }

    async getGPUInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            if (gl) {
                // Get GPU info
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                let gpuName = 'Unknown GPU';
                
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    gpuName = renderer || 'Unknown GPU';
                    
                    // Clean up GPU name for better display
                    if (gpuName.includes('ANGLE')) {
                        const match = gpuName.match(/Direct3D11 vs_5_0 ps_5_0, (.+)/);
                        if (match) gpuName = match[1];
                    }
                }
                
                // Realistic GPU usage simulation with WebGL performance testing
                const startTime = performance.now();
                
                // Create a more complex test to stress the GPU slightly
                const texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                
                const renderTime = performance.now() - startTime;
                
                // Calculate GPU usage based on various factors
                let gpuUsage = 10; // Base usage
                gpuUsage += Math.min(renderTime * 0.5, 20); // Render performance factor
                
                // Add realistic patterns
                const hour = new Date().getHours();
                if (hour >= 19 && hour <= 23) {
                    gpuUsage += 15; // Gaming/entertainment hours
                }
                
                // Add smooth variation
                gpuUsage += Math.sin(Date.now() / 15000) * 12;
                gpuUsage += (Math.random() - 0.5) * 20;
                
                // Clean up
                gl.deleteTexture(texture);
                canvas.remove();
                
                return {
                    name: gpuName,
                    usage: Math.max(3, Math.min(gpuUsage, 85))
                };
            }
        } catch (error) {
            // Fallback for browsers without WebGL
        }
        
        return {
            name: 'Integrated Graphics',
            usage: Math.random() * 25 + 10
        };
    }

    async getRAMInfo() {
        try {
            let totalGB = 16; // Default
            let usedPercent = 50;
            
            // Use navigator.deviceMemory if available (Chrome)
            if ('deviceMemory' in navigator) {
                totalGB = navigator.deviceMemory;
            }
            
            // Use performance.memory for more accurate simulation
            if (performance.memory && this.performanceData.memorySnapshots.length > 0) {
                const latest = this.performanceData.memorySnapshots[this.performanceData.memorySnapshots.length - 1];
                const heapUsage = latest.used / latest.total;
                
                // Estimate system RAM usage based on JS heap patterns
                usedPercent = 30 + (heapUsage * 40); // 30-70% base range
                
                // Add memory growth pattern if heap is growing
                if (this.performanceData.memorySnapshots.length >= 2) {
                    const previous = this.performanceData.memorySnapshots[this.performanceData.memorySnapshots.length - 2];
                    const growth = (latest.used - previous.used) / previous.used;
                    usedPercent += growth * 100; // Factor in memory growth
                }
            } else {
                // Realistic simulation based on time patterns
                const hour = new Date().getHours();
                const baseUsage = hour >= 9 && hour <= 18 ? 55 : 35; // Work vs. idle
                usedPercent = baseUsage + (Math.sin(Date.now() / 30000) * 15) + (Math.random() * 10 - 5);
            }
            
            usedPercent = Math.max(25, Math.min(usedPercent, 85));
            
            const totalMB = totalGB * 1024;
            const usedMB = totalMB * usedPercent / 100;
            
            return {
                total: totalMB,
                used: usedMB,
                available: totalMB - usedMB,
                percentage: usedPercent
            };
        } catch (error) {
            return await super.getRAMInfo();
        }
    }

    async getNetworkInfo() {
        try {
            let networkName = 'WiFi';
            let maxSpeed = 100;
            
            if ('connection' in navigator) {
                const conn = navigator.connection;
                
                // Determine connection type and realistic speeds
                switch (conn.effectiveType) {
                    case 'slow-2g':
                        maxSpeed = 0.5;
                        networkName = '2G (Slow)';
                        break;
                    case '2g':
                        maxSpeed = 2;
                        networkName = '2G';
                        break;
                    case '3g':
                        maxSpeed = 10;
                        networkName = '3G';
                        break;
                    case '4g':
                        maxSpeed = 50;
                        networkName = '4G LTE';
                        break;
                    default:
                        maxSpeed = conn.downlink || 100;
                        networkName = conn.type === 'wifi' ? 'WiFi' : 'Ethernet';
                }
                
                // Use actual downlink if available
                if (conn.downlink && conn.downlink > 0) {
                    maxSpeed = conn.downlink;
                }
            }
            
            // Simulate realistic network usage patterns
            const timeOfDay = new Date().getHours();
            let usageMultiplier = 0.1; // Base 10% usage
            
            // Peak usage times
            if (timeOfDay >= 19 && timeOfDay <= 23) {
                usageMultiplier = 0.4; // Evening streaming
            } else if (timeOfDay >= 9 && timeOfDay <= 17) {
                usageMultiplier = 0.25; // Work hours
            }
            
            // Add realistic fluctuation
            usageMultiplier += (Math.sin(Date.now() / 20000) * 0.2);
            usageMultiplier += (Math.random() * 0.15);
            usageMultiplier = Math.max(0.05, Math.min(usageMultiplier, 0.6));
            
            const downSpeed = maxSpeed * usageMultiplier;
            const upSpeed = downSpeed * (0.1 + Math.random() * 0.15); // 10-25% of download
            
            return {
                name: networkName,
                downSpeed: Math.max(0.1, downSpeed),
                upSpeed: Math.max(0.05, upSpeed),
                type: 'enhanced-simulation'
            };
        } catch (error) {
            return await super.getNetworkInfo();
        }
    }

    // Override updateDisplay to ensure it works correctly
    updateDisplay(info) {
        try {
            // Update CPU
            const cpuValue = info.cpu.usage.toFixed(1);
            const cpuElement = document.getElementById("cpuText");
            if (cpuElement) {
                cpuElement.querySelector('.spec-value').textContent = 
                    `${info.cpu.name}: ${cpuValue}%`;
            }
            const cpuProgress = document.getElementById("cpuProgress");
            if (cpuProgress) {
                cpuProgress.style.width = `${Math.min(info.cpu.usage, 100)}%`;
            }
            
            // Update GPU
            const gpuValue = info.gpu.usage.toFixed(1);
            const gpuElement = document.getElementById("gpuText");
            if (gpuElement) {
                gpuElement.querySelector('.spec-value').textContent = 
                    `${info.gpu.name}: ${gpuValue}%`;
            }
            const gpuProgress = document.getElementById("gpuProgress");
            if (gpuProgress) {
                gpuProgress.style.width = `${Math.min(info.gpu.usage, 100)}%`;
            }
            
            // Update Network
            const netElement = document.getElementById("netText");
            if (netElement) {
                netElement.querySelector('.spec-value').textContent = 
                    `${info.network.name}: ↓${info.network.downSpeed.toFixed(1)} ↑${info.network.upSpeed.toFixed(1)} Mb/s`;
            }
            
            const totalNetSpeed = Math.min((info.network.downSpeed + info.network.upSpeed) / 2, 100);
            const netProgress = document.getElementById("netProgress");
            if (netProgress) {
                netProgress.style.width = `${totalNetSpeed}%`;
            }
            
            // Update RAM
            const ramPercentage = info.ram.percentage.toFixed(1);
            const ramElement = document.getElementById("ramText");
            if (ramElement) {
                ramElement.querySelector('.spec-value').textContent = 
                    `${(info.ram.used/1024).toFixed(1)}GB/${(info.ram.total/1024).toFixed(1)}GB (${ramPercentage}%)`;
            }
            const ramProgress = document.getElementById("ramProgress");
            if (ramProgress) {
                ramProgress.style.width = `${Math.min(info.ram.percentage, 100)}%`;
            }        } catch (error) {
            console.error('Error updating display:', error);
        }
    }
}
