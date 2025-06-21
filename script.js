class HackerDesktop {
    constructor() {
        this.windows = new Map();
        this.windowZIndex = 100;
        this.draggedWindow = null;
        this.dragOffset = { x: 0, y: 0 };
        this.resizingWindow = null;
        this.resizeStart = null;

        this.init();
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        this.bindEvents();

        // Show welcome message
        setTimeout(() => {
            this.openTerminal();
        }, 1000);
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('clock').textContent = timeString;
    }

    bindEvents() {
        // Desktop icon clicks
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const app = e.currentTarget.dataset.app;
                this.openApp(app);
            });
        });

        // Window dragging and resizing
        document.addEventListener('mousedown', (e) => {
            const windowHeader = e.target.closest('.window-header');
            const windowElement = e.target.closest('.window');
            
            if (windowHeader && !e.target.closest('.window-controls')) {
                e.preventDefault();
                this.startDrag(e, windowElement);
            } else if (windowElement && this.isResizeHandle(e, windowElement)) {
                e.preventDefault();
                this.startResize(e, windowElement);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.draggedWindow) {
                this.drag(e);
            } else if (this.resizingWindow) {
                this.resize(e);
            } else {
                this.updateCursor(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.stopDrag();
            this.stopResize();
        });

        // Prevent text selection during drag
        document.addEventListener('selectstart', (e) => {
            if (this.draggedWindow || this.resizingWindow) {
                e.preventDefault();
            }
        });
    }

    openApp(appName) {
        switch(appName) {
            case 'terminal':
                this.openTerminal();
                break;
            case 'file-manager':
                this.openFileManager();
                break;
            case 'network-monitor':
                this.openNetworkMonitor();
                break;
            case 'system-monitor':
                this.openSystemMonitor();
                break;
            case 'code-editor':
                this.openCodeEditor();
                break;
            case 'password-cracker':
                this.openPasswordCracker();
                break;
        }
    }

    createWindow(title, content, width = 600, height = 400) {
        const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const windowElement = document.createElement('div');
        windowElement.className = 'window active';
        windowElement.id = windowId;
        windowElement.style.width = width + 'px';
        windowElement.style.height = height + 'px';
        windowElement.style.left = (50 + this.windows.size * 30) + 'px';
        windowElement.style.top = (50 + this.windows.size * 30) + 'px';
        windowElement.style.zIndex = ++this.windowZIndex;

        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-title">${title}</div>
                <div class="window-controls">
                    <div class="window-control minimize">−</div>
                    <div class="window-control maximize">□</div>
                    <div class="window-control close">×</div>
                </div>
            </div>
            <div class="window-content">
                ${content}
            </div>
        `;

        document.getElementById('windows-container').appendChild(windowElement);

        // Bind window controls
        windowElement.querySelector('.close').addEventListener('click', () => {
            this.closeWindow(windowId);
        });

        windowElement.querySelector('.minimize').addEventListener('click', () => {
            this.minimizeWindow(windowId);
        });

        windowElement.addEventListener('mousedown', () => {
            this.focusWindow(windowId);
        });

        this.windows.set(windowId, {
            element: windowElement,
            title: title,
            minimized: false
        });

        this.addToTaskbar(windowId, title);

        return windowId;
    }

    openTerminal() {
        const content = `
            <div class="terminal">
                <div class="terminal-output" id="terminal-output"></div>
                <div class="terminal-input" id="terminal-input-container" style="display: none;">
                    <span class="terminal-prompt"><span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span><br><span class="user-prompt">└─</span><span class="host-prompt">#</span></span>
                    <input type="text" class="terminal-command" id="terminal-command" autocomplete="off">
                </div>
            </div>
        `;

        const windowId = this.createWindow('root@kali: ~', content, 800, 600);

        // Terminal functionality
        const commandInput = document.getElementById('terminal-command');
        const output = document.getElementById('terminal-output');
        const inputContainer = document.getElementById('terminal-input-container');

        // Simulate realistic boot sequence
        this.simulateBootSequence(output, inputContainer, commandInput);

        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = commandInput.value.trim();
                this.executeCommand(command, output);
                commandInput.value = '';
            }
        });

        // Add realistic terminal behaviors
        this.setupRealisticTerminalBehavior(commandInput, output);

        // Auto-focus when clicking in terminal
        output.addEventListener('click', () => {
            if (inputContainer.style.display !== 'none') {
                commandInput.focus();
            }
        });
    }

    simulateBootSequence(output, inputContainer, commandInput) {
        const bootMessages = [
            '[    0.000000] Linux version 5.10.0-kali7-amd64 (devel@kali.org) (gcc version 10.2.1)',
            '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.10.0-kali7-amd64 root=UUID=12345678-1234-1234-1234-123456789abc ro quiet splash',
            '[    0.000000] KERNEL supported cpus:',
            '[    0.000000]   Intel GenuineIntel',
            '[    0.000000]   AMD AuthenticAMD',
            '[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'',
            '[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: \'SSE registers\'',
            '[    0.000000] x86/fpu: Supporting XSAVE feature 0x004: \'AVX registers\'',
            '[    0.000000] x86/fpu: xstate_offset[2]:  576, xstate_sizes[2]:  256',
            '[    0.000000] x86/fpu: Enabled xstate features 0x7, context size is 832 bytes',
            '[    0.028000] Secure boot disabled',
            '[    0.028000] ACPI: Early table checksum verification disabled',
            '[    0.045000] ACPI: RSDP 0x00000000000F0490 000024 (v02 VBOX  )',
            '[    0.045000] ACPI: XSDT 0x00000000DFFFE0E0 00003C (v01 VBOX   VBOXXSDT 00000001      01000013)',
            '[    0.156000] Zone ranges:',
            '[    0.156000]   DMA      [mem 0x0000000000001000-0x0000000000ffffff]',
            '[    0.156000]   DMA32    [mem 0x0000000001000000-0x00000000ffffffff]',
            '[    0.156000]   Normal   [mem 0x0000000100000000-0x000000041fffffff]',
            '[    0.234000] ACPI: PM-Timer IO Port: 0x4008',
            '[    0.345000] NET: Registered protocol family 16',
            '[    0.456000] audit: initializing netlink subsys (disabled)',
            '[    0.567000] PCI: Using configuration type 1 for base access',
            '[    0.678000] HugeTLB registered 2.00 MiB page size, pre-allocated 0 pages',
            '[    0.789000] SCSI subsystem initialized',
            '[    0.890000] usbcore: registered new interface driver usbfs',
            '[    1.234000] Advanced Linux Sound Architecture Driver Initialized.',
            '[    1.345000] PCI: Probing PCI hardware',
            '[    1.456000] PCI: root bus 00: using default resources',
            '[    1.567000] e1000: Intel(R) PRO/1000 Network Driver - version 7.3.21-k8-NAPI',
            '[    1.678000] e1000: Copyright (c) 1999-2006 Intel Corporation.',
            '[    1.789000] input: Power Button as /devices/LNXSYSTM:00/LNXPWRBN:00/input/input0',
            '[    1.890000] ACPI: Power Button [PWRF]',
            '[    2.123000] NET: Registered protocol family 2',
            '[    2.234000] tcp_listen_portaddr_hash hash table entries: 8192 (order: 5, 131072 bytes)',
            '[    2.345000] TCP established hash table entries: 131072 (order: 8, 1048576 bytes)',
            '[    2.456000] UDP hash table entries: 8192 (order: 6, 262144 bytes)',
            '[    2.567000] NET: Registered protocol family 1',
            '[    2.678000] Unpacking initramfs...',
            '[    3.123000] Freeing initrd memory: 32768K',
            '[    3.234000] platform rtc_cmos: registered platform RTC device (no PNP device found)',
            '[    3.345000] Machine check exception polling timer started.',
            '[    3.456000] Installing knfsd (copyright (C) 1996 okir@monad.swb.de).',
            '[    3.567000] FS-Cache: Loaded',
            '[    3.678000] CacheFiles: Loaded',
            '[    3.789000] msgmni has been set to 15909',
            '[    3.890000] Block layer SCSI generic (bsg) driver version 0.4 loaded (major 253)',
            '[    4.123000] io scheduler noop registered',
            '[    4.234000] io scheduler deadline registered (default)',
            '[    4.345000] io scheduler cfq registered',
            '[    4.456000] pci_hotplug: PCI Hot Plug PCI Core version: 0.5',
            '[    4.567000] vesafb: mode is 1024x768x32, linelength=4096, pages=0',
            '[    4.678000] vesafb: scrolling: redraw',
            '[    4.789000] vesafb: Truecolor: size=8:8:8:8, shift=24:16:8:0',
            '[    4.890000] vesafb: framebuffer at 0xe0000000, mapped to 0xffffc90000080000, using 3072k, total 16384k',
            '[    5.123000] Console: switching to colour frame buffer device 128x48',
            '[    5.234000] fb0: VESA VGA frame buffer device',
            '[    5.345000] input: ImExPS/2 Generic Explorer Mouse as /devices/platform/i8042/serio1/input/input3',
            '[    5.456000] rtc_cmos 00:00: RTC can wake from S4',
            '[    5.567000] rtc_cmos 00:00: rtc core: registered rtc_cmos as rtc0',
            '[    5.678000] rtc_cmos 00:00: alarms up to one day, y3k, 242 bytes nvram, hpet irqs',
            '[    5.789000] TCP: cubic registered',
            '[    5.890000] NET: Registered protocol family 17',
            '[    6.123000] Using IPI No-Shortcut mode',
            '[    6.234000] registered taskstats version 1',
            '[    6.345000] Magic number: 0:240:166',
            '[    6.456000] rtc_cmos 00:00: setting system clock to 2024-01-15 19:42:37 UTC (1705347757)',
            '[    6.567000] Freeing unused kernel memory: 1316k freed',
            '[    6.678000] Write protecting the kernel read-only data: 8192k',
            '[    6.789000] Freeing unused kernel memory: 1408k freed',
            '[    6.890000] Freeing unused kernel memory: 1064k freed',
            '[    7.123000] systemd[1]: systemd 247.3-7+deb11u1 running in system mode.',
            '[    7.234000] systemd[1]: Detected architecture x86-64.',
            '[    7.345000] systemd[1]: Set hostname to &lt;kali&gt;.',
            '',
            '<span class="command-success">Welcome to Kali GNU/Linux Rolling</span>',
            '',
            '<span class="command-info">  ██╗  ██╗ █████╗ ██╗     ██╗</span>',
            '<span class="command-info">  ██║ ██╔╝██╔══██╗██║     ██║</span>',
            '<span class="command-info">  █████╔╝ ███████║██║     ██║</span>',
            '<span class="command-info">  ██╔═██╗ ██╔══██║██║     ██║</span>',
            '<span class="command-info">  ██║  ██╗██║  ██║███████╗██║</span>',
            '<span class="command-info">  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝</span>',
            '',
            '<span class="command-warning">       /$$   /$$  /$$$$$$  /$$       /$$</span>',
            '<span class="command-warning">      | $$  /$$/ /$$__  $$| $$      |__/</span>',
            '<span class="command-warning">      | $$ /$$/ | $$  \\ $$| $$       /$$</span>',
            '<span class="command-warning">      | $$$$$/  | $$$$$$$$| $$      | $$</span>',
            '<span class="command-warning">      | $$  $$  | $$__  $$| $$      | $$</span>',
            '<span class="command-warning">      | $$\\  $$ | $$  | $$| $$      | $$</span>',
            '<span class="command-warning">      | $$ \\  $$| $$  | $$| $$$$$$$$| $$</span>',
            '<span class="command-warning">      |__/  \\__/|__/  |__/|________/|__/</span>',
            '',
            'Kali GNU/Linux Rolling \\n \\l',
            '',
            'The programs included with the Kali GNU/Linux system are free software;',
            'the exact distribution terms for each program are described in the',
            'individual files in /usr/share/doc/*/copyright.',
            '',
            'Kali GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent',
            'permitted by applicable law.',
            '',
            `Last login: ${new Date().toString().substring(0, 24)} from 192.168.1.100`,
            ''
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < bootMessages.length) {
                if (bootMessages[i] === '') {
                    output.innerHTML += '\n';
                } else {
                    output.innerHTML += bootMessages[i] + '\n';
                }
                output.scrollTop = output.scrollHeight;
                i++;
            } else {
                clearInterval(interval);
                // Show the prompt after boot sequence
                output.innerHTML += '<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> ';
                inputContainer.style.display = 'block';
                commandInput.focus();
            }
        }, Math.random() * 50 + 10); // Random delay between 10-60ms for realistic boot timing
    }

    setupRealisticTerminalBehavior(commandInput, output) {
        let commandHistory = [];
        let historyIndex = -1;

        // Command history with arrow keys
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex] || '';
                } else if (historyIndex === 0) {
                    historyIndex = -1;
                    commandInput.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion(commandInput);
            } else if (e.key === 'Enter') {
                const command = commandInput.value.trim();
                if (command && !commandHistory.includes(command)) {
                    commandHistory.push(command);
                    if (commandHistory.length > 1000) {
                        commandHistory = commandHistory.slice(-1000);
                    }
                }
                historyIndex = -1;
            }
        });

        // Add blinking cursor effect
        this.addBlinkingCursor(commandInput);

        // Simulate typing delays for more realism
        let lastKeyTime = 0;
        commandInput.addEventListener('input', (e) => {
            const now = Date.now();
            if (now - lastKeyTime < 50) {
                // Too fast, add slight delay
                setTimeout(() => {
                    // Add subtle typing sound effect simulation
                    this.simulateKeystroke();
                }, Math.random() * 20);
            }
            lastKeyTime = now;
        });
    }

    handleTabCompletion(commandInput) {
        const value = commandInput.value;
        const commands = [
            'nmap', 'hydra', 'john', 'hashcat', 'sqlmap', 'nikto', 'dirb', 'gobuster',
            'msfconsole', 'msfvenom', 'searchsploit', 'burpsuite', 'aircrack-ng',
            'wireshark', 'metasploit', 'ettercap', 'recon-ng', 'theharvester',
            'ls', 'cd', 'pwd', 'whoami', 'ps', 'top', 'netstat', 'ifconfig',
            'ping', 'ssh', 'scp', 'wget', 'curl', 'nano', 'vim', 'cat', 'grep',
            'find', 'chmod', 'chown', 'sudo', 'apt', 'dpkg', 'systemctl'
        ];

        const matches = commands.filter(cmd => cmd.startsWith(value));
        if (matches.length === 1) {
            commandInput.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            // Show available options
            const output = document.getElementById('terminal-output');
            output.innerHTML += `<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> ${value}\n`;
            output.innerHTML += matches.join('  ') + '\n';
            output.innerHTML += '<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> ';
            output.scrollTop = output.scrollHeight;
        }
    }

    addBlinkingCursor(input) {
        // Add CSS class for blinking cursor
        input.style.caretColor = '#00ff41';
        input.style.animation = 'blink 1s infinite';
    }

    simulateKeystroke() {
        // Create a subtle audio context for typing sound simulation
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            try {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800 + Math.random() * 200, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
            } catch (e) {
                // Audio not supported, continue silently
            }
        }
    }

    startInfinitePasswordCracking(output) {
        // Add command to output first
        output.innerHTML += `<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> crack-passwords\n`;
        
        // Initial setup message
        output.innerHTML += `<span class="command-warning">[+] INFINITE PASSWORD CRACKING ENGINE v4.2.0</span>
<span class="command-info">[*] Initializing quantum-enhanced brute force framework...</span>
<span class="command-success">[+] Loading 47 billion password combinations...</span>
<span class="command-warning">[+] Distributed computing nodes: 1,337 active</span>
<span class="command-success">[+] GPU acceleration: NVIDIA RTX 4090 x 8 cards</span>
<span class="command-warning">[+] Hash algorithms: MD5, SHA-1, SHA-256, bcrypt, scrypt, Argon2</span>
<span class="command-info">[*] Target database: 250,000 password hashes loaded</span>
<span class="command-success">[+] Rainbow tables: 14.7 TB loaded into memory</span>
<span class="command-warning">[+] Network scanning for additional targets...</span>
<span class="command-error">[!] CRACKING INITIATED - INFINITE MODE ACTIVATED</span>
<span class="command-info">[*] Press Ctrl+C to stop the cracking process</span>\n`;

        output.scrollTop = output.scrollHeight;

        // Password lists for random generation
        const commonPasswords = [
            'password123', 'admin', 'letmein', 'welcome', 'monkey', '123456789', 'password1',
            'qwerty123', 'abc123', 'Password1', 'secret', 'root', 'toor', 'admin123',
            'welcome123', 'hello', 'love', 'princess', 'dragon', 'master', 'shadow',
            'superman', 'michael', 'jennifer', 'jordan', 'michelle', 'daniel', 'jessica',
            'killer', 'hunter', 'tigger', 'charlie', 'football', 'baseball', 'soccer'
        ];

        const usernames = [
            'admin', 'administrator', 'root', 'user', 'test', 'guest', 'demo', 'backup',
            'manager', 'service', 'operator', 'support', 'webmaster', 'ftp', 'mail',
            'www', 'web', 'db', 'database', 'mysql', 'oracle', 'postgres', 'jenkins',
            'tomcat', 'apache', 'nginx', 'elastic', 'redis', 'mongo', 'node', 'docker'
        ];

        const hashTypes = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'NTLM', 'bcrypt', 'scrypt', 'Argon2'];
        const algorithms = ['Dictionary', 'Brute-force', 'Hybrid', 'Rule-based', 'Markov', 'PRINCE'];

        let crackedCount = 0;
        let totalAttempts = 0;
        let speed = 2847.3; // Initial speed in MH/s

        const crackingInterval = setInterval(() => {
            totalAttempts += Math.floor(Math.random() * 50000) + 10000;
            
            // Randomly crack passwords (about 15% success rate)
            if (Math.random() < 0.15) {
                crackedCount++;
                const username = usernames[Math.floor(Math.random() * usernames.length)];
                const password = commonPasswords[Math.floor(Math.random() * commonPasswords.length)];
                const hashType = hashTypes[Math.floor(Math.random() * hashTypes.length)];
                const hash = this.generateFakeHash();
                
                output.innerHTML += `<span class="command-success">[+] CRACKED: ${username}:${password} (${hashType})</span>\n`;
                output.innerHTML += `<span class="command-warning">    Hash: ${hash}</span>\n`;
            }

            // Update progress every few iterations
            if (totalAttempts % 75000 < 50000) {
                speed = (Math.random() * 1000 + 2000).toFixed(1);
                const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
                const currentHash = hashTypes[Math.floor(Math.random() * hashTypes.length)];
                
                output.innerHTML += `<span class="command-info">[*] Speed: ${speed} MH/s | Algorithm: ${algorithm} | Hash: ${currentHash}</span>\n`;
                output.innerHTML += `<span class="command-warning">[*] Progress: ${totalAttempts.toLocaleString()} attempts | Cracked: ${crackedCount} passwords</span>\n`;
                
                // Add some advanced techniques randomly
                const techniques = [
                    'Loading custom wordlist: leaked_passwords_2024.txt (47.2M passwords)',
                    'Applying mutation rules: l33t speak, capitalization, numbers',
                    'Implementing mask attack: ?l?l?l?l?d?d?d?d',
                    'Using combinator attack: wordlist1.txt + wordlist2.txt',
                    'Executing PRINCE algorithm with keyspace reduction',
                    'Applying Markov chains for statistical password generation',
                    'Loading hashcat rules: best64.rule, d3ad0ne.rule, dive.rule',
                    'Implementing distributed cracking across 47 nodes',
                    'Using GPU optimization: CUDA cores fully utilized',
                    'Loading rainbow tables: 8.4TB ntlm_mixalpha-numeric#1-9',
                    'Applying social engineering wordlists: company names, dates',
                    'Using OSINT-gathered passwords from breach databases'
                ];
                
                if (Math.random() < 0.3) {
                    const technique = techniques[Math.floor(Math.random() * techniques.length)];
                    output.innerHTML += `<span class="command-info">[*] ${technique}</span>\n`;
                }
            }

            // Occasionally show advanced status
            if (totalAttempts % 200000 < 50000) {
                const stats = [
                    `Temperature: GPU ${Math.floor(Math.random() * 15 + 75)}°C | CPU ${Math.floor(Math.random() * 10 + 65)}°C`,
                    `Memory usage: ${Math.floor(Math.random() * 20 + 70)}% | VRAM: ${Math.floor(Math.random() * 15 + 80)}%`,
                    `Network: ${(Math.random() * 100 + 50).toFixed(1)} MB/s download | ${(Math.random() * 50 + 20).toFixed(1)} MB/s upload`,
                    `Database queries: ${Math.floor(Math.random() * 1000 + 5000)}/sec | Cache hits: ${Math.floor(Math.random() * 20 + 85)}%`,
                    `Wordlist position: ${Math.floor(Math.random() * 40 + 30)}% | Estimated completion: ${Math.floor(Math.random() * 8 + 4)} hours`
                ];
                
                const stat = stats[Math.floor(Math.random() * stats.length)];
                output.innerHTML += `<span class="command-warning">[+] ${stat}</span>\n`;
            }

            // Show vulnerability discoveries
            if (Math.random() < 0.08) {
                const vulns = [
                    'Weak password policy detected: minimum 6 characters',
                    'Password reuse detected across multiple accounts',
                    'Default credentials found: admin/admin, root/toor',
                    'Plaintext passwords stored in database',
                    'Unsalted MD5 hashes detected - CRITICAL vulnerability',
                    'Service account with weak password discovered',
                    'Shared service account detected: backup/backup123',
                    'Admin account with password based on company name'
                ];
                
                const vuln = vulns[Math.floor(Math.random() * vulns.length)];
                output.innerHTML += `<span class="command-error">[!] VULNERABILITY: ${vuln}</span>\n`;
            }

            output.scrollTop = output.scrollHeight;
        }, Math.random() * 800 + 400); // Random interval between 400-1200ms

        // Store the interval ID so it can be stopped if needed
        this.passwordCrackingInterval = crackingInterval;

        // Add keyboard listener to stop on Ctrl+C
        const stopListener = (e) => {
            if (e.ctrlKey && e.key === 'c') {
                clearInterval(crackingInterval);
                output.innerHTML += `\n<span class="command-error">[!] CRACKING STOPPED BY USER (Ctrl+C)</span>\n`;
                output.innerHTML += `<span class="command-success">[+] Session summary: ${crackedCount} passwords cracked in ${totalAttempts.toLocaleString()} attempts</span>\n`;
                output.innerHTML += `<span class="command-info">[*] Average speed: ${speed} MH/s</span>\n`;
                output.innerHTML += `<span class="command-warning">[+] Results saved to: /root/cracked_passwords_${Date.now()}.txt</span>\n`;
                output.innerHTML += '<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> ';
                output.scrollTop = output.scrollHeight;
                document.removeEventListener('keydown', stopListener);
                
                // Re-enable command input
                const commandInput = document.getElementById('terminal-command');
                if (commandInput) {
                    commandInput.disabled = false;
                    commandInput.focus();
                }
            }
        };

        document.addEventListener('keydown', stopListener);

        // Disable command input during animation
        const commandInput = document.getElementById('terminal-command');
        if (commandInput) {
            commandInput.disabled = true;
        }
    }

    generateFakeHash() {
        const chars = '0123456789abcdef';
        let hash = '';
        const length = Math.random() < 0.3 ? 64 : 32; // SHA-256 or MD5 length
        
        for (let i = 0; i < length; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return hash;
    }

    generateRealisticHash(hashType) {
        const chars = '0123456789abcdef';
        let hash = '';
        let length;
        
        switch(hashType) {
            case 'MD5':
                length = 32;
                break;
            case 'SHA-1':
                length = 40;
                break;
            case 'SHA-256':
                length = 64;
                break;
            case 'SHA-512':
                length = 128;
                break;
            case 'NTLM':
                length = 32;
                break;
            case 'bcrypt':
                return '$2b$12$' + Array.from({length: 53}, () => 
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'[Math.floor(Math.random() * 64)]
                ).join('');
            case 'scrypt':
                return '$scrypt$N=16384,r=8,p=1$' + Array.from({length: 32}, () => 
                    chars[Math.floor(Math.random() * chars.length)]
                ).join('') + '$' + Array.from({length: 64}, () => 
                    chars[Math.floor(Math.random() * chars.length)]
                ).join('');
            case 'Argon2':
                return '$argon2id$v=19$m=4096,t=3,p=1$' + Array.from({length: 22}, () => 
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[Math.floor(Math.random() * 64)]
                ).join('') + '$' + Array.from({length: 43}, () => 
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[Math.floor(Math.random() * 64)]
                ).join('');
            default:
                length = 32;
        }
        
        for (let i = 0; i < length; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return hash;
    }

    executeCommand(command, output) {
        const responses = {
            'help': `<span class="command-info">Available commands:</span>
  <span class="command-success">ls</span>        - List directory contents
  <span class="command-success">whoami</span>    - Display current user
  <span class="command-success">uname</span>     - System information  
  <span class="command-success">ps</span>        - Show running processes
  <span class="command-success">netstat</span>   - Network connections
  <span class="command-success">clear</span>     - Clear terminal
  <span class="command-success">pwd</span>       - Print working directory
  <span class="command-success">date</span>      - Show current date and time
  <span class="command-success">id</span>        - Show user and group IDs

  <span class="command-info">Password Cracking:</span>
  <span class="command-warning">john [hashfile]</span>      - John the Ripper password cracker
  <span class="command-warning">hashcat [hashes]</span>     - Advanced password recovery
  <span class="command-warning">hydra [target] [service]</span> - Brute force authentication
  <span class="command-warning">medusa</span>               - Parallel brute-forcer
  <span class="command-warning">crunch</span>               - Wordlist generator
  <span class="command-warning">ophcrack</span>             - Windows password cracker
  <span class="command-warning">cewl</span>                 - Custom wordlist generator

  <span class="command-info">Network Reconnaissance:</span>
  <span class="command-warning">nmap [target]</span>        - Network port scanner
  <span class="command-warning">gobuster -u [url]</span>   - Directory/file enumeration
  <span class="command-warning">dirb</span>                 - Web content scanner
  <span class="command-warning">nikto</span>                - Web vulnerability scanner
  <span class="command-warning">masscan</span>              - High-speed port scanner
  <span class="command-warning">enum4linux</span>           - SMB enumeration tool
  <span class="command-warning">fierce</span>               - DNS enumeration
  <span class="command-warning">recon-ng</span>             - Reconnaissance framework
  <span class="command-warning">theharvester</span>         - Email/subdomain harvester
  <span class="command-warning">shodan</span>               - Internet-connected device search

  <span class="command-info">Web Application Testing:</span>
  <span class="command-warning">sqlmap [url]</span>         - SQL injection testing
  <span class="command-warning">burpsuite</span>            - Web application security testing
  <span class="command-warning">beef</span>                 - Browser exploitation framework

  <span class="command-info">Wireless Security:</span>
  <span class="command-warning">aircrack-ng [capfile]</span> - WEP/WPA/WPA2 cracking
  <span class="command-warning">airodump-ng</span>          - Wireless network detection
  <span class="command-warning">reaver</span>               - WPS attack tool

  <span class="command-info">Exploitation Frameworks:</span>
  <span class="command-warning">msfconsole</span>           - Metasploit framework
  <span class="command-warning">msfvenom</span>             - Payload generator
  <span class="command-warning">searchsploit</span>         - Exploit database search
  <span class="command-warning">empire</span>               - Post-exploitation framework
  <span class="command-warning">armitage</span>             - Cyber attack management

  <span class="command-info">Social Engineering:</span>
  <span class="command-warning">setoolkit</span>            - Social-Engineer Toolkit
  <span class="command-warning">gophish</span>              - Phishing framework

  <span class="command-info">Network Attacks:</span>
  <span class="command-warning">ettercap</span>             - Network sniffer/interceptor
  <span class="command-warning">dsniff</span>               - Password sniffer

  <span class="command-info">Custom Simulations:</span>
  <span class="command-warning">simulate-breach</span>      - Advanced breach simulation
  <span class="command-warning">penetration-test [target]</span> - Automated pentest
  <span class="command-warning">custom-exploit [target]</span> - Custom exploit framework
  <span class="command-warning">keylogger</span>            - Keylogger simulation
  <span class="command-warning">ransomware</span>           - Ransomware simulation (SAFE)
  <span class="command-warning">botnet</span>               - Botnet C&C simulation
  <span class="command-warning">backdoor</span>             - Backdoor creation simulation
  <span class="command-warning">ddos</span>                 - DDoS attack simulation
  <span class="command-warning">crack-passwords</span>      - Infinite password cracking animation

  <span class="command-info">Fun Commands:</span>
  <span class="command-warning">hack</span>                 - Initiate hacking sequence
  <span class="command-warning">matrix</span>               - Enter the matrix

  <span class="command-info">Note:</span> Most tools support parameters. Try: nmap 192.168.1.100 or hydra target ssh`,

            'ls': `total 48
drwx------ 18 root root 4096 Jan 15 14:30 <span class="command-info">.</span>
drwxr-xr-x 19 root root 4096 Jan 15 12:15 <span class="command-info">..</span>
-rw-------  1 root root 1024 Jan 15 14:25 <span class="command-success">.bash_history</span>
-rw-r--r--  1 root root  570 Jan 10 01:06 <span class="command-success">.bashrc</span>
drwxr-xr-x  2 root root 4096 Jan 15 14:30 <span class="command-info">Desktop</span>
drwxr-xr-x  2 root root 4096 Jan 15 14:30 <span class="command-info">Documents</span>
drwxr-xr-x  2 root root 4096 Jan 15 14:30 <span class="command-info">Downloads</span>
-rwxr-xr-x  1 root root 8192 Jan 15 14:30 <span class="command-warning">exploit.py</span>
-rwxr-xr-x  1 root root 2048 Jan 15 14:30 <span class="command-warning">keylogger.c</span>
-rw-r--r--  1 root root  161 Dec  5 19:20 <span class="command-success">.profile</span>
drwxr-xr-x  2 root root 4096 Jan 15 14:30 <span class="command-info">Tools</span>`,

            'whoami': '<span class="command-success">root</span>',

            'pwd': '<span class="command-success">/root</span>',

            'id': '<span class="command-success">uid=0(root) gid=0(root) groups=0(root)</span>',

            'date': `<span class="command-success">${new Date().toString()}</span>`,

            'uname': '<span class="command-success">Linux</span>',

            'uname -a': '<span class="command-success">Linux kali 5.10.0-kali7-amd64 #1 SMP Debian 5.10.28-1kali1 (2021-04-12) x86_64 GNU/Linux</span>',

            'env': `<span class="command-success">USER=root</span>
<span class="command-success">LOGNAME=root</span>
<span class="command-success">HOME=/root</span>
<span class="command-success">PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin</span>
<span class="command-success">MAIL=/var/mail/root</span>
<span class="command-success">SHELL=/bin/bash</span>
<span class="command-success">TERM=xterm-256color</span>
<span class="command-success">LANG=en_US.UTF-8</span>
<span class="command-success">LC_ALL=en_US.UTF-8</span>
<span class="command-success">PWD=/root</span>
<span class="command-success">OLDPWD=/root</span>
<span class="command-success">DEBIAN_FRONTEND=noninteractive</span>
<span class="command-success">DISPLAY=:0.0</span>
<span class="command-success">SSH_TTY=/dev/pts/0</span>
<span class="command-success">SSH_CONNECTION=192.168.1.100 54321 192.168.1.50 22</span>`,

            'history': `    1  apt update && apt upgrade -y
    2  nmap -sS 192.168.1.0/24
    3  hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.100
    4  john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
    5  sqlmap -u "http://192.168.1.100/login.php?id=1" --dbs
    6  msfconsole
    7  searchsploit apache 2.4
    8  nikto -h http://192.168.1.100
    9  gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
   10  aircrack-ng -w /usr/share/wordlists/rockyou.txt capture.cap
   11  hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt
   12  ettercap -T -M arp:remote /192.168.1.1// /192.168.1.100//
   13  setoolkit
   14  msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -f exe > payload.exe
   15  ssh-keygen -t rsa -b 4096
   16  scp payload.exe user@192.168.1.100:/tmp/
   17  nc -lvnp 4444
   18  python3 -m http.server 8080
   19  wget http://192.168.1.100/backup.zip
   20  unzip backup.zip
   21  strings backup.txt | grep -i password
   22  base64 -d encoded.txt
   23  openssl enc -aes-256-cbc -d -in encrypted.dat -out decrypted.txt
   24  tcpdump -i eth0 -w capture.pcap
   25  wireshark capture.pcap &`,

            'dmesg | tail': `[456789.123456] usb 2-1: new full-speed USB device number 3 using uhci_hcd
[456789.234567] usb 2-1: New USB device found, idVendor=0781, idProduct=5567, bcdDevice= 1.26
[456789.345678] usb 2-1: New USB device strings: Mfr=1, Product=2, SerialNumber=3
[456789.456789] usb 2-1: Product: Cruzer Blade
[456789.567890] usb 2-1: Manufacturer: SanDisk
[456789.678901] usb 2-1: SerialNumber: 4C530001071218104254
[456789.789012] usb-storage 2-1:1.0: USB Mass Storage device detected
[456789.890123] scsi host6: usb-storage 2-1:1.0
[456790.901234] scsi 6:0:0:0: Direct-Access     SanDisk  Cruzer Blade     1.26 PQ: 0 ANSI: 6
[456791.012345] sd 6:0:0:0: [sdb] 15728640 512-byte logical blocks: (8.05 GB/7.51 GiB)`,

            'lsusb': `Bus 002 Device 003: ID 0781:5567 SanDisk Corp. Cruzer Blade
Bus 002 Device 002: ID 8087:0024 Intel Corp. Integrated Rate Matching Hub
Bus 002 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 001 Device 003: ID 0e0f:0003 VMware, Inc. Virtual Mouse
Bus 001 Device 002: ID 0e0f:0002 VMware, Inc. Virtual USB Hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub`,

            'lspci': `00:00.0 Host bridge: Intel Corporation 440FX - 82441FX PMC [Natoma] (rev 02)
00:01.0 ISA bridge: Intel Corporation 82371SB PIIX3 ISA [Natoma/Triton II]
00:01.1 IDE interface: Intel Corporation 82371AB/EB/MB PIIX4 IDE (rev 01)
00:02.0 VGA compatible controller: InnoTek Systemberatung GmbH VirtualBox Graphics Adapter
00:03.0 Ethernet controller: Intel Corporation 82540EM Gigabit Ethernet Controller (rev 02)
00:04.0 System peripheral: InnoTek Systemberatung GmbH VirtualBox Guest Service
00:05.0 Multimedia audio controller: Intel Corporation 82801AA AC'97 Audio Controller (rev 01)
00:06.0 USB controller: Apple Inc. KeyLargo/Intrepid USB
00:07.0 Bridge: Intel Corporation 82371AB/EB/MB PIIX4 ACPI (rev 08)`,

            'mount': `sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
udev on /dev type devtmpfs (rw,nosuid,relatime,size=4063004k,nr_inodes=1015751,mode=755)
devpts on /dev/pts type devpts (rw,nosuid,noexec,relatime,gid=5,mode=620,ptmxmode=000)
tmpfs on /run type tmpfs (rw,nosuid,noexec,relatime,size=813972k,mode=755)
/dev/sda1 on / type ext4 (rw,relatime,errors=remount-ro)
securityfs on /sys/kernel/security type securityfs (rw,nosuid,nodev,noexec,relatime)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
tmpfs on /run/lock type tmpfs (rw,nosuid,nodev,noexec,relatime,size=5120k)
tmpfs on /sys/fs/cgroup type tmpfs (ro,nosuid,nodev,noexec,mode=755)
cgroup on /sys/fs/cgroup/systemd type cgroup (rw,nosuid,nodev,noexec,relatime,xattr,release_agent=/lib/systemd/systemd-cgroups-agent,name=systemd)`,

            'free -h': `              total        used        free      shared  buff/cache   available
Mem:           7.8G        3.2G        1.5G        234M        3.1G        4.1G
Swap:          2.0G          0B        2.0G`,

            'df -h': `Filesystem      Size  Used Avail Use% Mounted on
udev            3.9G     0  3.9G   0% /dev
tmpfs           795M  1.7M  794M   1% /run
/dev/sda1        49G   23G   24G  49% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/sda15      105M  5.2M  100M   5% /boot/efi
tmpfs           795M     0  795M   0% /run/user/0`,

            'lscpu': `Architecture:                    x86_64
CPU op-mode(s):                  32-bit, 64-bit
Byte Order:                      Little Endian
Address sizes:                   39 bits physical, 48 bits virtual
CPU(s):                          4
On-line CPU(s) list:             0-3
Thread(s) per core:              2
Core(s) per socket:              2
Socket(s):                       1
NUMA node(s):                    1
Vendor ID:                       GenuineIntel
CPU family:                      6
Model:                           142
Model name:                      Intel(R) Core(TM) i7-12700K CPU @ 3.60GHz
Stepping:                        10
CPU MHz:                         3600.000
CPU max MHz:                     5000.0000
CPU min MHz:                     800.0000
BogoMIPS:                        7200.00
Virtualization:                  VT-x
L1d cache:                       64 KiB
L1i cache:                       64 KiB
L2 cache:                        512 KiB
L3 cache:                        25 MiB
NUMA node0 CPU(s):               0-3`,

            'ps': `<span class="command-success">  PID TTY          TIME CMD</span>
    1 ?        00:00:01 systemd
  123 ?        00:00:00 kthreadd  
  456 ?        00:00:00 ksoftirqd/0
  789 pts/0    00:00:00 bash
 1337 pts/0    00:00:00 <span class="command-warning">exploit</span>
 1521 pts/0    00:00:00 ps`,

            'netstat': `<span class="command-info">Active Internet connections (w/o servers)</span>
<span class="command-success">Proto Recv-Q Send-Q Local Address           Foreign Address         State</span>
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN  
tcp        0      0 192.168.1.100:443       203.0.113.1:80          ESTABLISHED
tcp6       0      0 :::22                   :::*                    LISTEN`,

            'clear': 'CLEAR',

            'hack': `<span class="command-warning">[+] Initializing hacking sequence...</span>
<span class="command-warning">[+] Loading exploit modules...</span>
<span class="command-success">[+] Scanning for vulnerabilities...</span>
<span class="command-success">[+] Found 13 open ports on target 192.168.1.0/24</span>
<span class="command-warning">[+] Exploiting buffer overflow in service...</span>
<span class="command-warning">[+] Payload delivered successfully</span>
<span class="command-success">[+] Gaining root access...</span>
<span class="command-success">[+] Access GRANTED! Welcome to the mainframe.</span>
<span class="command-info">[!] Remember: With great power comes great responsibility.</span>`,

            'matrix': `<span class="command-success">Wake up, Neo...</span>
<span class="command-info">The Matrix has you...</span>  
<span class="command-warning">Follow the white rabbit.</span>
<span class="command-success">Knock, knock, Neo.</span>`,

            'ifconfig': `<span class="command-success">eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500</span>
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20&lt;link&gt;
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 2847  bytes 4067896 (3.8 MiB)
        TX packets 1983  bytes 244761 (239.0 KiB)`,

            'cat /etc/passwd': `<span class="command-success">root:x:0:0:root:/root:/bin/bash</span>
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
<span class="command-warning">hacker:x:1000:1000:Elite Hacker,,,:/home/hacker:/bin/bash</span>
mysql:x:112:117:MySQL Server,,,:/nonexistent:/bin/false`,

            'ssh': `<span class="command-info">usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]</span>
           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]
           [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]
           [-i identity_file] [-J [user@]host[:port]] [-L address]
           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]
           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]
           [-w local_tun[:remote_tun]] destination [command]`,

            'ping google.com': `<span class="command-success">PING google.com (142.250.191.14) 56(84) bytes of data.</span>
64 bytes from lga25s62-in-f14.1e100.net (142.250.191.14): icmp_seq=1 ttl=115 time=23.4 ms
64 bytes from lga25s62-in-f14.1e100.net (142.250.191.14): icmp_seq=2 ttl=115 time=22.1 ms
64 bytes from lga25s62-in-f14.1e100.net (142.250.191.14): icmp_seq=3 ttl=115 time=21.8 ms
^C
--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
time 2003ms
rtt min/avg/max/mdev = 21.805/22.433/23.402/0.697 ms`,

            'top': `<span class="command-success">top - 15:42:30 up 2 days,  3:17,  1 user,  load average: 0.52, 0.58, 0.62</span>
Tasks: 267 total,   1 running, 266 sleeping,   0 stopped,   0 zombie
%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.6 id,  0.1 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7936.2 total,   1847.3 free,   3421.8 used,   2667.1 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   4182.3 avail Mem

<span class="command-info">  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND</span>
 1337 root      20   0  156412  45216  32768 S   5.9   0.6   0:12.34 <span class="command-warning">exploit</span>
 2048 root      20   0  892456  78432  45216 S   3.2   1.0   1:23.45 <span class="command-warning">metasploit</span>
 3141 hacker    20   0   12.3g 445216 123456 S   2.1   5.5   2:34.56 <span class="command-warning">burpsuite</span>`,

            'burpsuite': `<span class="command-info">Burp Suite Professional v2023.10.2.4</span>
<span class="command-success">[+] Starting Burp Suite...</span>
<span class="command-success">[+] Loading extensions...</span>
<span class="command-success">[+] Proxy listening on 127.0.0.1:8080</span>
<span class="command-warning">[!] Ready for web application testing</span>
<span class="command-info">[*] Remember to configure your browser proxy settings</span>`,

            'masscan': `<span class="command-info">masscan 1.3.2 ( https://github.com/robertdavidgraham/masscan )</span>
<span class="command-success">Usage: masscan [options] -p&lt;ports&gt; &lt;targets&gt;</span>
<span class="command-info">Examples:</span>
  masscan -p80,8000-8100 10.0.0.0/8
  masscan --banners -p80,443 --rate=1000 scanme.nmap.org
  masscan -p80,443 --rate=1000 --excludefile exclude.txt 10.0.0.0/8`,

            'enum4linux': `<span class="command-info">enum4linux v0.8.9 ( http://labs.portcullis.co.uk/application/enum4linux/ )</span>
<span class="command-success">[+] Target Information</span>
<span class="command-success">[+] Getting domain SID for 192.168.1.100</span>
<span class="command-warning">[+] Domain Name: WORKGROUP</span>
<span class="command-warning">[+] Domain Sid: (NULL SID)</span>
<span class="command-success">[+] Host is part of a workgroup (not a domain)</span>`,

            'fierce': `<span class="command-info">Fierce v1.4.0</span>
<span class="command-success">[+] Checking for wildcard DNS...</span>
<span class="command-success">[+] Performing DNS enumeration on example.com</span>
<span class="command-warning">Found: www.example.com (93.184.216.34)</span>
<span class="command-warning">Found: mail.example.com (93.184.216.35)</span>
<span class="command-warning">Found: ftp.example.com (93.184.216.36)</span>`,

            'recon-ng': `<span class="command-info">Recon-ng v5.1.2</span>
<span class="command-success">[recon-ng][default] &gt; </span>
<span class="command-info">[*] No modules enabled/installed.</span>
<span class="command-info">[*] Please see the wiki for instructions on installation.</span>
<span class="command-warning">[*] 28 modules available.</span>`,

            'theharvester': `<span class="command-info">*******************************************************************</span>
<span class="command-info">*  _   _                                                     *</span>
<span class="command-info">* | |_| |__   ___    /\  /\__ _ _ ____   _____  ___| |_ ___ _ __  *</span>
<span class="command-info">* | __| '_ \ / _ \  /  \/  / _\` | '__\ \ / / _ \/ __| __/ _ \ '__| *</span>
<span class="command-info">* | |_| | | |  __/ / /\  / (_| | |   \ V /  __/\__ \ ||  __/ |    *</span>
<span class="command-info">*  \__|_| |_|\___| \/  \/ \__,_|_|    \_/ \___||___/\__\___|_|    *</span>
<span class="command-info">*                                                               *</span>
<span class="command-info">* theHarvester 4.2.0                                          *</span>
<span class="command-info">* Coded by Christian Martorella                               *</span>
<span class="command-info">* Edge-Security Research                                       *</span>
<span class="command-info">*******************************************************************</span>`,

            'shodan': `<span class="command-info">Shodan Command-Line Interface</span>
<span class="command-success">Usage: shodan [OPTIONS] COMMAND [ARGS]...</span>
<span class="command-info">Commands:</span>
  <span class="command-warning">search</span>    Search Shodan
  <span class="command-warning">host</span>      View all available information for an IP address
  <span class="command-warning">count</span>     Returns the number of results for a search query
  <span class="command-warning">download</span>  Download search results and save them in a compressed JSON file`,

            'beef': `<span class="command-info">Browser Exploitation Framework (BeEF)</span>
<span class="command-success">[+] BeEF is loading. Wait a few more seconds...</span>
<span class="command-success">[+] BeEF server started on port 3000</span>
<span class="command-warning">[*] Web UI panel: http://127.0.0.1:3000/ui/panel</span>
<span class="command-warning">[*] Hook URL: http://127.0.0.1:3000/hook.js</span>`,

            'armitage': `<span class="command-info">Armitage - Cyber Attack Management for Metasploit</span>
<span class="command-success">[+] Starting Armitage...</span>
<span class="command-success">[+] Connecting to Metasploit RPC on port 55553</span>
<span class="command-warning">[*] GUI interface loading...</span>
<span class="command-warning">[*] Ready for collaborative penetration testing</span>`,

            'social-engineer-toolkit': `<span class="command-info">Social-Engineer Toolkit (SET) v8.0.3</span>
<span class="command-warning">Select from the menu:</span>

   1) Spear-Phishing Attack Vectors
   2) Website Attack Vectors  
   3) Infectious Media Generator
   4) Create a Payload and Listener
   5) Mass Mailer Attack
   6) Arduino-Based Attack Vector
   7) Wireless Access Point Attack Vector
   8) QRCode Generator Attack Vector
   9) Powershell Attack Vectors
  10) Third Party Modules`,

            'exploit': `<span class="command-warning">[+] Initializing exploit framework...</span>
<span class="command-success">[+] Loading payload modules...</span>
<span class="command-warning">[+] Scanning target 192.168.1.0/24...</span>
<span class="command-success">[+] Vulnerabilities found:</span>
<span class="command-warning">    - CVE-2021-44228 (Log4Shell)</span>
<span class="command-warning">    - CVE-2017-0144 (EternalBlue)</span>
<span class="command-warning">    - CVE-2014-6271 (Shellshock)</span>
<span class="command-success">[+] Exploit modules ready for deployment</span>
<span class="command-info">[!] Use with caution - Educational purposes only</span>`,

            'backdoor': `<span class="command-warning">[+] Generating backdoor payload...</span>
<span class="command-success">[+] Creating reverse shell...</span>
<span class="command-success">[+] Payload size: 4096 bytes</span>
<span class="command-warning">[+] Backdoor installed successfully</span>
<span class="command-warning">[+] Listening on port 4444...</span>
<span class="command-success">[+] Connection established from 192.168.1.50</span>
<span class="command-info">[!] Persistent access achieved</span>`,

            'ddos': `<span class="command-warning">[+] Initializing DDoS attack simulation...</span>
<span class="command-success">[+] Botnet status: 1337 zombies online</span>
<span class="command-warning">[+] Target: 192.168.1.100:80</span>
<span class="command-warning">[+] Attack vector: HTTP flood</span>
<span class="command-success">[+] Packets per second: 50,000</span>
<span class="command-warning">[+] Attack duration: 300 seconds</span>
<span class="command-error">[!] Target server overwhelmed - Service unavailable</span>
<span class="command-info">[!] Simulation complete - No actual harm done</span>`,

            'grep': `<span class="command-info">usage: grep [OPTION]... PATTERN [FILE]...</span>
<span class="command-info">Search for PATTERN in each FILE.</span>
Example: grep -r "password" /etc/`,

            'wget': `<span class="command-info">GNU Wget 1.21.2 built on linux-gnu.</span>
<span class="command-success">Usage: wget [OPTION]... [URL]...</span>
Try \`wget --help' for more options.`,

            'curl': `<span class="command-info">curl 7.81.0 (x86_64-pc-linux-gnu)</span>
<span class="command-success">Usage: curl [options...] &lt;url&gt;</span>`,

            'nano': `<span class="command-info">GNU nano 6.2</span>
<span class="command-success">[+] Text editor ready</span>
<span class="command-info">^X Exit  ^O Write Out  ^R Read File  ^Y Prev Page</span>`,

            // Advanced Password Cracking Tools
            'john': `<span class="command-info">John the Ripper 1.9.0-jumbo-1 (OMP) [linux-gnu 64-bit]</span>
<span class="command-success">[+] Starting password cracking session...</span>
<span class="command-warning">[+] Loaded 1337 password hashes</span>
<span class="command-success">[+] Using wordlist: /usr/share/wordlists/rockyou.txt</span>
<span class="command-warning">[+] Cracking progress: 23.7% (3,245,678/13,692,400)</span>
<span class="command-success">[+] Passwords cracked: 47</span>
<span class="command-warning">admin:admin123</span>
<span class="command-warning">user1:password</span>
<span class="command-warning">guest:qwerty</span>
<span class="command-info">[*] Estimated time remaining: 14m 32s</span>`,

            'hashcat': `<span class="command-info">hashcat (v6.2.6) starting...</span>
<span class="command-success">[+] OpenCL API (OpenCL 3.0 ) - Platform #1 [Intel(R) Corporation]</span>
<span class="command-warning">[+] Device #1: Intel(R) Core(TM) i7-12700K, 8192/16384 MB</span>
<span class="command-success">[+] Attack-Mode: Dictionary (2)</span>
<span class="command-info">[*] Hash-Type: MD5</span>
<span class="command-warning">[+] Speed: 2,847.3 MH/s</span>
<span class="command-success">[+] Progress: 45672/14344385 (0.32%)</span>
<span class="command-warning">5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8:password</span>
<span class="command-success">[+] Cracked 1 hash in 0:00:23</span>`,

            'hydra': `<span class="command-info">Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak</span>
<span class="command-success">[+] Starting brute force attack...</span>
<span class="command-warning">[+] Target: 192.168.1.100:22 (SSH)</span>
<span class="command-info">[*] Trying username/password combinations...</span>
<span class="command-warning">[22][ssh] host: 192.168.1.100   login: admin   password: admin123</span>
<span class="command-warning">[22][ssh] host: 192.168.1.100   login: root    password: toor</span>
<span class="command-success">[+] 2 of 2 targets successfully completed, 2 valid passwords found</span>
<span class="command-info">[*] Session finished</span>`,

            'medusa': `<span class="command-info">Medusa v2.2 [http://www.foofus.net] (C) JoMo-Kun / Foofus Networks</span>
<span class="command-success">[+] Starting authentication brute-forcer...</span>
<span class="command-warning">[+] Target: 192.168.1.100 (FTP)</span>
<span class="command-info">[*] Testing credentials...</span>
<span class="command-warning">ACCOUNT CHECK: [ftp] Host: 192.168.1.100 (1 of 1, 0 complete) User: admin (1 of 50, 0 complete) Password: admin (1 of 100, 0 complete)</span>
<span class="command-success">ACCOUNT FOUND: [ftp] Host: 192.168.1.100 User: admin Password: admin123 [SUCCESS]</span>
<span class="command-info">[*] Attack completed</span>`,

            'crunch': `<span class="command-info">Crunch 3.6</span>
<span class="command-success">[+] Generating custom wordlist...</span>
<span class="command-warning">[+] Pattern: @@@@@@@@</span>
<span class="command-info">[*] Min length: 8, Max length: 8</span>
<span class="command-warning">[+] Character set: abcdefghijklmnopqrstuvwxyz0123456789</span>
<span class="command-success">[+] Estimated passwords: 2,821,109,907,456</span>
<span class="command-info">[*] Output: /tmp/wordlist.txt</span>
<span class="command-warning">[+] Progress: aaaaaaaa aaaaaaab aaaaaaac...</span>`,

            'ophcrack': `<span class="command-info">Ophcrack 3.8.0</span>
<span class="command-success">[+] Loading Windows SAM file...</span>
<span class="command-warning">[+] Found 12 user accounts</span>
<span class="command-info">[*] Using rainbow tables: Vista Special</span>
<span class="command-success">[+] Cracking LM hashes...</span>
<span class="command-warning">Administrator:ADMIN123</span>
<span class="command-warning">Guest:guest</span>
<span class="command-warning">User1:PASSWORD</span>
<span class="command-success">[+] Cracked 3/12 passwords</span>`,

            'cewl': `<span class="command-info">CeWL 5.5.2 (Couple of Employees Wordlist) Robin Wood</span>
<span class="command-success">[+] Spidering target website...</span>
<span class="command-warning">[+] URL: https://example.com</span>
<span class="command-info">[*] Depth: 2, Min word length: 3</span>
<span class="command-success">[+] Found 1,247 unique words</span>
<span class="command-warning">[+] Writing to wordlist.txt...</span>
<span class="command-info">[*] Common words found: company, security, password, login, admin</span>`,

            // Network Reconnaissance
            'nmap': `<span class="command-info">Starting Nmap 7.94 ( https://nmap.org )</span>
<span class="command-success">[+] Scanning 192.168.1.0/24...</span>
<span class="command-warning">Nmap scan report for 192.168.1.1</span>
Host is up (0.0012s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https

<span class="command-warning">Nmap scan report for 192.168.1.100</span>
Host is up (0.0034s latency).
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 3.0.3
22/tcp   open  ssh         OpenSSH 8.2p1
80/tcp   open  http        Apache httpd 2.4.41
3306/tcp open  mysql       MySQL 8.0.25

<span class="command-success">[+] Scan completed: 254 hosts scanned in 45.23 seconds</span>`,

            'nikto': `<span class="command-info">- Nikto v2.5.0</span>
<span class="command-success">[+] Starting web vulnerability scan...</span>
<span class="command-warning">[+] Target: http://192.168.1.100</span>
<span class="command-info">+ Server: Apache/2.4.41 (Ubuntu)</span>
<span class="command-warning">+ /admin/: Admin login page detected</span>
<span class="command-warning">+ /backup/: Backup directory found</span>
<span class="command-error">+ /config.php.bak: Configuration backup file exposed</span>
<span class="command-error">+ OSVDB-3092: /admin/: This might be interesting...</span>
<span class="command-warning">+ 7545 requests: 0 error(s) and 23 item(s) reported</span>`,

            'sqlmap': `<span class="command-info">sqlmap/1.7.2 - automatic SQL injection tool</span>
<span class="command-success">[+] Testing connection to target...</span>
<span class="command-warning">[+] Target: http://192.168.1.100/login.php?id=1</span>
<span class="command-info">[*] Testing parameter 'id'</span>
<span class="command-warning">[+] Parameter 'id' is vulnerable to SQL injection</span>
<span class="command-success">[+] Database: MySQL 8.0.25</span>
<span class="command-warning">[+] Current user: 'webapp@localhost'</span>
<span class="command-warning">[+] Available databases: information_schema, mysql, users</span>
<span class="command-error">[!] Privilege escalation possible</span>`,

            'dirb': `<span class="command-info">DIRB v2.22</span>
<span class="command-success">[+] Scanning URL: http://192.168.1.100/</span>
<span class="command-info">[*] Wordlist: /usr/share/dirb/wordlists/common.txt</span>
<span class="command-warning">+ http://192.168.1.100/admin/ (CODE:200|SIZE:1247)</span>
<span class="command-warning">+ http://192.168.1.100/backup/ (CODE:301|SIZE:316)</span>
<span class="command-warning">+ http://192.168.1.100/config/ (CODE:403|SIZE:277)</span>
<span class="command-warning">+ http://192.168.1.100/index.php (CODE:200|SIZE:5432)</span>
<span class="command-warning">+ http://192.168.1.100/login.php (CODE:200|SIZE:1876)</span>
<span class="command-success">[+] Scan completed: 4614 directories scanned</span>`,

            'gobuster': `<span class="command-info">Gobuster v3.6</span>
<span class="command-success">[+] Starting directory enumeration...</span>
<span class="command-warning">[+] URL: http://192.168.1.100</span>
<span class="command-info">[*] Wordlist: /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt</span>
<span class="command-warning">/admin                (Status: 200) [Size: 1247]</span>
<span class="command-warning">/images               (Status: 301) [Size: 313]</span>
<span class="command-warning">/uploads              (Status: 301) [Size: 314]</span>
<span class="command-warning">/backup               (Status: 403) [Size: 277]</span>
<span class="command-warning">/api                  (Status: 200) [Size: 86]</span>
<span class="command-success">[+] Enumeration completed</span>`,

            // Wireless Security Tools
            'aircrack-ng': `<span class="command-info">Aircrack-ng 1.7</span>
<span class="command-success">[+] Starting WEP/WPA/WPA2 key cracking...</span>
<span class="command-warning">[+] Reading packets from capture.cap</span>
<span class="command-info">[*] Found 1 target network: "HomeWiFi"</span>
<span class="command-warning">[+] WPA (2 handshakes) found: HomeWiFi</span>
<span class="command-success">[+] Testing password: password123</span>
<span class="command-success">[+] KEY FOUND! [ password123 ]</span>
<span class="command-info">[*] Decrypted correctly (100%)</span>`,

            'airodump-ng': `<span class="command-info">airodump-ng 1.7</span>
<span class="command-success">[+] Scanning for wireless networks...</span>
<span class="command-warning"> BSSID              PWR  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID</span>
<span class="command-info"> AA:BB:CC:DD:EE:FF  -42       85        0    0  11  54e  WPA2 CCMP   PSK  HomeWiFi</span>
<span class="command-info"> 11:22:33:44:55:66  -67       23        0    0   6  54e  WEP  WEP         OpenNet</span>
<span class="command-info"> FF:EE:DD:CC:BB:AA  -89       12        0    0   1  54e  WPA2 CCMP   PSK  OfficeNet</span>
<span class="command-success">[+] 3 networks detected</span>`,

            'reaver': `<span class="command-info">Reaver v1.6.6 WiFi Protected Setup Attack Tool</span>
<span class="command-success">[+] Starting WPS PIN attack...</span>
<span class="command-warning">[+] Target: AA:BB:CC:DD:EE:FF (HomeWiFi)</span>
<span class="command-info">[*] Trying PIN: 12345670</span>
<span class="command-warning">[+] PIN found: 12345670</span>
<span class="command-success">[+] WPA PSK: 'password123'</span>
<span class="command-info">[*] AP SSID: 'HomeWiFi'</span>`,

            // Metasploit Framework
            'msfconsole': `<span class="command-info">       =[ metasploit v6.3.25-dev                         ]</span>
<span class="command-warning">+ -- --=[ 2328 exploits - 1219 auxiliary - 413 post       ]</span>
<span class="command-warning">+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]</span>
<span class="command-warning">+ -- --=[ 9 evasion                                       ]</span>

<span class="command-success">msf6 ></span> <span class="command-info">use exploit/multi/handler</span>
<span class="command-success">[*] Using configured payload generic/shell_reverse_tcp</span>
<span class="command-success">msf6 exploit(multi/handler) ></span> <span class="command-info">set LHOST 192.168.1.100</span>
<span class="command-warning">LHOST => 192.168.1.100</span>
<span class="command-success">msf6 exploit(multi/handler) ></span> <span class="command-info">exploit</span>
<span class="command-success">[*] Started reverse TCP handler on 192.168.1.100:4444</span>`,

            'msfvenom': `<span class="command-info">MsfVenom - a Metasploit standalone payload generator.</span>
<span class="command-success">[+] Generating payload...</span>
<span class="command-warning">[+] Payload: windows/meterpreter/reverse_tcp</span>
<span class="command-info">[*] LHOST=192.168.1.100, LPORT=4444</span>
<span class="command-warning">[+] Platform: Windows, Arch: x86</span>
<span class="command-success">[+] Payload size: 354 bytes</span>
<span class="command-warning">[+] Final size: 73728 bytes</span>
<span class="command-success">[+] Saved as: payload.exe</span>`,

            // Advanced exploitation
            'searchsploit': `<span class="command-info">Exploit Database Archive Search</span>
<span class="command-success">[+] Searching for: apache 2.4</span>
<span class="command-warning">--------------------------------------------------- ---------------------------------</span>
<span class="command-warning"> Exploit Title                                     |  Path</span>
<span class="command-warning">--------------------------------------------------- ---------------------------------</span>
<span class="command-info">Apache 2.4.49 - Path Traversal (Metasploit)       | linux/remote/50383.rb</span>
<span class="command-info">Apache 2.4.50 - Remote Code Execution             | linux/remote/50406.py</span>
<span class="command-info">Apache HTTP Server 2.4 - mod_rewrite Off-by-One   | linux/remote/47688.txt</span>
<span class="command-warning">--------------------------------------------------- ---------------------------------</span>`,

            'empire': `<span class="command-info">Empire 5.0.0</span>
<span class="command-success">[+] Starting Empire C2 Framework...</span>
<span class="command-warning">[+] Database: empire.db</span>
<span class="command-info">[*] Loading modules...</span>
<span class="command-success">[+] 312 modules loaded</span>
<span class="command-warning">[+] Starting HTTP listener on port 8080</span>
<span class="command-success">(Empire) ></span> <span class="command-info">Agents: 0 | Listeners: 1</span>`,

            // Social Engineering
            'setoolkit': `<span class="command-info">Social-Engineer Toolkit 8.0.3</span>
<span class="command-warning">         01) Social-Engineering Attacks</span>
<span class="command-warning">         02) Penetration Testing (Fast-Track)</span>
<span class="command-warning">         03) Third Party Modules</span>
<span class="command-warning">         04) Update the Social-Engineer Toolkit</span>
<span class="command-warning">         05) Update SET configuration</span>
<span class="command-warning">         06) Help, Credits, and About</span>
<span class="command-info">set> </span>1
<span class="command-success">[+] Starting credential harvester...</span>`,

            'gophish': `<span class="command-info">Gophish v0.12.1</span>
<span class="command-success">[+] Starting phishing framework...</span>
<span class="command-warning">[+] Admin panel: https://127.0.0.1:3333</span>
<span class="command-info">[*] Default credentials: admin:gophish</span>
<span class="command-success">[+] SMTP server started on port 587</span>
<span class="command-warning">[+] Phishing server started on port 80</span>`,

            // Advanced Network Tools
            'ettercap': `<span class="command-info">ettercap 0.8.3</span>
<span class="command-success">[+] Starting ARP spoofing attack...</span>
<span class="command-warning">[+] Target 1: 192.168.1.50</span>
<span class="command-warning">[+] Target 2: 192.168.1.1 (Gateway)</span>
<span class="command-info">[*] Intercepting traffic...</span>
<span class="command-success">[+] Captured 127 packets</span>
<span class="command-warning">[+] Credentials found: user:password123</span>`,

            'dsniff': `<span class="command-info">dsniff 2.4</span>
<span class="command-success">[+] Starting password sniffer...</span>
<span class="command-warning">[+] Listening on interface: eth0</span>
<span class="command-info">[*] Protocols: ftp, telnet, pop, http</span>
<span class="command-warning">12/25/23 15:42:30 ftp 192.168.1.50 -> 192.168.1.100 USER admin PASS admin123</span>
<span class="command-warning">12/25/23 15:43:15 http 192.168.1.45 -> 192.168.1.100 POST login: user=admin&pass=secret</span>`,

            // Infinite password cracking animation
            'crack-passwords': 'INFINITE_CRACK',

            // Custom hacking simulations
            'simulate-breach': `<span class="command-warning">[+] ADVANCED PERSISTENT THREAT BREACH SIMULATION</span>
<span class="command-info">[*] Initializing multi-stage attack framework...</span>
<span class="command-success">[+] Loading reconnaissance modules... [████████████████████] 100%</span>
<span class="command-warning">[+] Establishing encrypted command channels on ports 443, 8080, 9001</span>
<span class="command-info">[*] Phase 1: OSINT & Passive Reconnaissance [EXECUTING]</span>
<span class="command-success">    ↳ Harvesting employee emails from social media...</span>
<span class="command-success">    ↳ DNS enumeration: 47 subdomains discovered</span>
<span class="command-success">    ↳ Certificate transparency logs analyzed</span>
<span class="command-success">    ↳ Shodan scan completed: 23 exposed services</span>
<span class="command-warning">[+] Phase 2: Active Network Discovery [EXECUTING]</span>
<span class="command-info">    ↳ TCP SYN scan: 192.168.1.0/24 (254 hosts)</span>
<span class="command-info">    ↳ UDP discovery scan initiated...</span>
<span class="command-success">    ↳ Live hosts: 23 | Open ports: 147 | Services: 89</span>
<span class="command-warning">    ↳ Vulnerable services detected: SMBv1, Telnet, FTP anonymous</span>
<span class="command-error">[!] Phase 3: Vulnerability Exploitation [CRITICAL]</span>
<span class="command-warning">    ↳ Exploiting MS17-010 (EternalBlue) on 192.168.1.50...</span>
<span class="command-success">    ↳ Payload injected: windows/x64/meterpreter/reverse_tcp</span>
<span class="command-success">    ↳ Meterpreter session established (Session 1)</span>
<span class="command-warning">    ↳ Privilege escalation: CVE-2021-36934 (HiveNightmare)</span>
<span class="command-error">[!] SYSTEM level access achieved on WORKSTATION-01</span>
<span class="command-info">[*] Phase 4: Lateral Movement & Persistence [ACTIVE]</span>
<span class="command-success">    ↳ Dumping LSASS memory for credential extraction...</span>
<span class="command-warning">    ↳ Extracted 17 password hashes, 8 Kerberos tickets</span>
<span class="command-success">    ↳ Golden ticket attack successful</span>
<span class="command-warning">    ↳ Installing persistence backdoor: WMI event subscription</span>
<span class="command-success">    ↳ Registry manipulation: HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run</span>
<span class="command-error">[!] Phase 5: Domain Controller Compromise [EXECUTING]</span>
<span class="command-warning">    ↳ DCSync attack initiated against DC01.corp.local</span>
<span class="command-success">    ↳ KRBTGT hash extracted: a1b2c3d4e5f6g7h8...</span>
<span class="command-error">    ↳ DOMAIN ADMIN privileges acquired</span>
<span class="command-warning">    ↳ Installing domain persistence: Golden ticket + Silver ticket</span>
<span class="command-error">[!!!] COMPLETE DOMAIN COMPROMISE ACHIEVED [!!!]</span>
<span class="command-info">[*] Exfiltrating sensitive data via DNS tunneling...</span>
<span class="command-warning">[+] Attack chain completed in 127 seconds</span>
<span class="command-info">[*] Cleanup phase: Removing event logs and forensic traces</span>`,

            'keylogger': `<span class="command-warning">[+] Advanced Keylogger & Data Harvesting Suite v3.7</span>
<span class="command-info">[*] Initializing stealth injection framework...</span>
<span class="command-success">[+] Loading kernel-level hooks and rootkit components</span>
<span class="command-warning">[+] Bypassing Windows Defender real-time protection...</span>
<span class="command-success">    ↳ AMSI bypass successful (Method: ETW patching)</span>
<span class="command-success">    ↳ Userland unhooking completed</span>
<span class="command-info">[*] Creating phantom process with PID spoofing...</span>
<span class="command-warning">    ↳ Target process: svchost.exe (PID: 1337)</span>
<span class="command-success">    ↳ Process hollowing successful</span>
<span class="command-success">    ↳ Code injection via AtomBombing technique</span>
<span class="command-info">[*] Installing low-level keyboard hooks...</span>
<span class="command-warning">    ↳ SetWindowsHookEx(WH_KEYBOARD_LL) registered</span>
<span class="command-success">    ↳ Raw input device monitoring active</span>
<span class="command-success">    ↳ USB HID device interception enabled</span>
<span class="command-info">[*] Deploying additional surveillance modules...</span>
<span class="command-warning">    ↳ Screen capture engine (every 30 seconds)</span>
<span class="command-success">    ↳ Clipboard monitoring activated</span>
<span class="command-success">    ↳ Audio recording via DirectSound API</span>
<span class="command-warning">    ↳ Browser password extraction module loaded</span>
<span class="command-info">[*] Establishing covert communication channels...</span>
<span class="command-success">    ↳ Primary C2: HTTPS/443 via CloudFlare tunnel</span>
<span class="command-success">    ↳ Backup C2: DNS exfiltration (8.8.8.8)</span>
<span class="command-warning">    ↳ Emergency C2: Twitter DM via API</span>
<span class="command-success">[+] Keylogger deployment successful - Zero detection</span>
<span class="command-info">[*] Real-time data capture active:</span>
<span class="command-warning">    ↳ Keystroke buffer: "admin@company.com"</span>
<span class="command-warning">    ↳ Password captured: "SuperSecret123!"</span>
<span class="command-warning">    ↳ Credit card: "4532-****-****-7856"</span>
<span class="command-success">    ↳ Data encrypted and exfiltrated (AES-256)</span>
<span class="command-info">[*] Session persistence established for 180 days</span>`,

            'ransomware': `<span class="command-error">[!] RANSOMWARE-AS-A-SERVICE DEPLOYMENT [EDUCATIONAL SIMULATION]</span>
<span class="command-warning">[+] Loading CryptoLocker 3.0 Advanced Encryption Engine</span>
<span class="command-info">[*] Initializing multi-threaded file enumeration system...</span>
<span class="command-success">    ↳ Scanning C:\\ drive (NTFS): 2,847,392 files found</span>
<span class="command-success">    ↳ Scanning network shares: 156 SMB shares detected</span>
<span class="command-success">    ↳ Scanning mapped drives: E:, F:, G:, H: (4 drives)</span>
<span class="command-warning">    ↳ Cloud storage detection: OneDrive, Dropbox, Google Drive</span>
<span class="command-info">[*] Filtering high-value target files...</span>
<span class="command-success">    ↳ Documents: .doc, .docx, .pdf, .xlsx (15,847 files)</span>
<span class="command-success">    ↳ Images: .jpg, .png, .tiff, .raw (8,234 files)</span>
<span class="command-success">    ↳ Databases: .sql, .mdb, .sqlite (127 files)</span>
<span class="command-success">    ↳ Source code: .py, .js, .cpp, .java (3,456 files)</span>
<span class="command-warning">[+] Generating cryptographic material...</span>
<span class="command-info">    ↳ RSA-4096 key pair generation... [██████████] 100%</span>
<span class="command-success">    ↳ Public key: 4096-bit modulus (617 decimal digits)</span>
<span class="command-warning">    ↳ AES-256-CBC session keys: 27,678 unique keys</span>
<span class="command-success">    ↳ ChaCha20-Poly1305 stream cipher initialized</span>
<span class="command-error">[!] Beginning file encryption process...</span>
<span class="command-info">    ↳ Thread 01: C:\\Users\\Documents\\ [████████░░] 87%</span>
<span class="command-info">    ↳ Thread 02: C:\\Users\\Pictures\\  [██████████] 100%</span>
<span class="command-info">    ↳ Thread 03: C:\\ProgramData\\     [███████░░░] 73%</span>
<span class="command-info">    ↳ Thread 04: \\\\SERVER\\Share\\     [█████░░░░░] 56%</span>
<span class="command-warning">[+] Deploying anti-forensics measures...</span>
<span class="command-success">    ↳ Volume Shadow Copy deletion via vssadmin</span>
<span class="command-success">    ↳ Windows Recovery Environment disabled</span>
<span class="command-success">    ↳ System Restore points wiped</span>
<span class="command-warning">    ↳ Event logs cleared (Security, System, Application)</span>
<span class="command-info">[*] Installing persistence mechanisms...</span>
<span class="command-success">    ↳ Registry autorun: HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run</span>
<span class="command-success">    ↳ Scheduled task: \\Microsoft\\Windows\\UpdateOrchestrator\\</span>
<span class="command-warning">    ↳ WMI event subscription for lateral movement</span>
<span class="command-error">[!!!] ENCRYPTION COMPLETE: 27,678 files processed [!!!]</span>
<span class="command-warning">[+] Generating ransom note in 47 languages...</span>
<span class="command-info">    ↳ Wallpaper changed to ransom message</span>
<span class="command-success">    ↳ README_FOR_DECRYPT.txt placed in each directory</span>
<span class="command-warning">    ↳ TOR payment portal: http://pay4decrypt.onion</span>
<span class="command-info">[*] Ransom amount: 5.7 Bitcoin (~$89,000 USD)</span>
<span class="command-success">[+] This is a SIMULATION - No files were actually encrypted!</span>
<span class="command-warning">[+] Educational demo completed successfully</span>`,

            'botnet': `<span class="command-warning">[+] DISTRIBUTED BOTNET COMMAND & CONTROL CENTER</span>
<span class="command-info">[*] Initializing Mirai++ Advanced Botnet Framework v4.2</span>
<span class="command-success">[+] Loading encrypted C2 infrastructure...</span>
<span class="command-warning">    ↳ Primary C2: bulletproof-hosting.onion (TOR)</span>
<span class="command-success">    ↳ Backup C2: fast-flux DNS network (47 domains)</span>
<span class="command-success">    ↳ Emergency C2: Twitter bot API (@NormalBot2023)</span>
<span class="command-info">[*] Establishing secure communication channels...</span>
<span class="command-warning">    ↳ Domain Generation Algorithm (DGA) active</span>
<span class="command-success">    ↳ ChaCha20 encryption with rotating keys</span>
<span class="command-success">    ↳ Traffic obfuscation via HTTP tunneling</span>
<span class="command-info">[*] Connecting to zombie network infrastructure...</span>
<span class="command-success">    ↳ Geographic distribution analysis:</span>
<span class="command-warning">      • North America: 2,847 bots (38.7%)</span>
<span class="command-warning">      • Europe: 1,923 bots (26.1%)</span>
<span class="command-warning">      • Asia-Pacific: 1,456 bots (19.8%)</span>
<span class="command-warning">      • South America: 687 bots (9.3%)</span>
<span class="command-warning">      • Africa: 234 bots (3.2%)</span>
<span class="command-warning">      • Others: 203 bots (2.9%)</span>
<span class="command-success">[+] Total botnet size: 7,350 compromised devices</span>
<span class="command-info">[*] Device type analysis:</span>
<span class="command-warning">    ↳ IoT cameras: 2,456 (33.4%)</span>
<span class="command-warning">    ↳ Home routers: 1,847 (25.1%)</span>
<span class="command-warning">    ↳ Windows PCs: 1,234 (16.8%)</span>
<span class="command-warning">    ↳ Android devices: 987 (13.4%)</span>
<span class="command-warning">    ↳ Linux servers: 546 (7.4%)</span>
<span class="command-warning">    ↳ Smart TVs: 280 (3.8%)</span>
<span class="command-info">[*] Performing botnet health check...</span>
<span class="command-success">    ↳ Response rate: 94.7% (6,961/7,350 responding)</span>
<span class="command-success">    ↳ Average latency: 127ms</span>
<span class="command-warning">    ↳ Bandwidth capacity: 847 Gbps aggregate</span>
<span class="command-info">[*] Available attack vectors:</span>
<span class="command-error">    ↳ DDoS amplification (DNS, NTP, SSDP, Memcached)</span>
<span class="command-error">    ↳ Layer 7 application attacks (HTTP flood, Slowloris)</span>
<span class="command-error">    ↳ Cryptocurrency mining (Monero, Ethereum)</span>
<span class="command-error">    ↳ Credential stuffing attacks</span>
<span class="command-error">    ↳ Click fraud & ad injection</span>
<span class="command-error">    ↳ Email spam distribution (SMTP relay)</span>
<span class="command-error">    ↳ Proxy/SOCKS tunneling services</span>
<span class="command-warning">[+] Botnet operational status: FULLY WEAPONIZED</span>
<span class="command-info">[*] Estimated daily revenue: $12,847 USD</span>
<span class="command-success">[+] Command interface ready - Type 'help' for attack options</span>`
        };

        // Add command to output with proper formatting
        output.innerHTML += `<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> ${command}\n`;

        if (command === 'clear') {
            output.innerHTML = '';
        } else if (command === 'crack-passwords') {
            this.startInfinitePasswordCracking(output);
            return; // Don't add prompt since animation is running
        } else if (responses[command]) {
            output.innerHTML += responses[command] + '\n<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> ';
        } else if (this.handleParameterizedCommands(command, output)) {
            // Command was handled by parameterized handler
        } else if (command) {
            output.innerHTML += `<span class="command-error">bash: ${command}: command not found</span>\n<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> `;
        }

        output.scrollTop = output.scrollHeight;
    }

    handleParameterizedCommands(command, output) {
        const parts = command.split(' ');
        const baseCommand = parts[0];
        const args = parts.slice(1);

        const parameterizedResponses = {
            'nmap': (args) => {
                const target = args[0] || '192.168.1.0/24';
                const options = args.includes('-sS') ? 'SYN Stealth Scan' : 'TCP Connect Scan';
                return `<span class="command-info">Starting Nmap 7.94 ( https://nmap.org )</span>
<span class="command-success">[+] Performing ${options} on ${target}...</span>
<span class="command-warning">Host: ${target.includes('/') ? target.split('/')[0] : target}</span>
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.2p1
80/tcp   open  http        Apache httpd 2.4.41
443/tcp  open  https       Apache httpd 2.4.41
3306/tcp open  mysql       MySQL 8.0.25
<span class="command-success">[+] Scan completed in 12.34 seconds</span>`;
            },

            'hydra': (args) => {
                const target = args[0] || '192.168.1.100';
                const service = args[1] || 'ssh';
                return `<span class="command-info">Hydra v9.4 - Brute Force Attack</span>
<span class="command-success">[+] Target: ${target}:${service === 'ssh' ? '22' : service === 'ftp' ? '21' : '80'} (${service.toUpperCase()})</span>
<span class="command-warning">[+] Wordlist: /usr/share/wordlists/rockyou.txt</span>
<span class="command-info">[*] Trying combinations...</span>
<span class="command-warning">[${service === 'ssh' ? '22' : service === 'ftp' ? '21' : '80'}][${service}] host: ${target}   login: admin   password: admin123</span>
<span class="command-success">[+] Attack completed - 1 valid password found</span>`;
            },

            'john': (args) => {
                const hashfile = args[0] || 'hashes.txt';
                const wordlist = args.includes('--wordlist') ? args[args.indexOf('--wordlist') + 1] : 'rockyou.txt';
                return `<span class="command-info">John the Ripper 1.9.0</span>
<span class="command-success">[+] Loading hashes from ${hashfile}...</span>
<span class="command-warning">[+] Detected hash type: MD5</span>
<span class="command-info">[*] Using wordlist: ${wordlist}</span>
<span class="command-success">[+] Cracking in progress...</span>
<span class="command-warning">5d41402abc4b2a76b9719d911017c592:hello</span>
<span class="command-warning">098f6bcd4621d373cade4e832627b4f6:test</span>
<span class="command-success">[+] Session completed - 2/5 hashes cracked</span>`;
            },

            'sqlmap': (args) => {
                const url = args[0] || 'http://192.168.1.100/login.php?id=1';
                return `<span class="command-info">sqlmap/1.7.2</span>
<span class="command-success">[+] Testing: ${url}</span>
<span class="command-warning">[+] Parameter 'id' appears to be vulnerable</span>
<span class="command-info">[*] Testing MySQL UNION injection...</span>
<span class="command-success">[+] Injection confirmed!</span>
<span class="command-warning">[+] Available databases: [3]</span>
<span class="command-info">[*] information_schema, mysql, webapp</span>
<span class="command-success">[+] Current user: 'webapp@localhost'</span>`;
            },

            'msfconsole': (args) => {
                if (args.includes('use')) {
                    const exploit = args[args.indexOf('use') + 1] || 'exploit/multi/handler';
                    return `<span class="command-success">[*] Using ${exploit}</span>
<span class="command-warning">msf6 ${exploit.split('/').pop()} ></span> <span class="command-info">show options</span>

Module options (${exploit}):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   LHOST                     yes       The listen address
   LPORT    4444             yes       The listen port

<span class="command-warning">msf6 ${exploit.split('/').pop()} ></span>`;
                }
                return `<span class="command-info">       =[ metasploit v6.3.25-dev                         ]</span>
<span class="command-warning">+ -- --=[ 2328 exploits - 1219 auxiliary - 413 post       ]</span>
<span class="command-success">msf6 ></span> <span class="command-info">Type 'help' for available commands</span>`;
            },

            'gobuster': (args) => {
                const url = args.includes('-u') ? args[args.indexOf('-u') + 1] : 'http://192.168.1.100';
                const wordlist = args.includes('-w') ? args[args.indexOf('-w') + 1] : 'common.txt';
                return `<span class="command-info">Gobuster v3.6</span>
<span class="command-success">[+] URL: ${url}</span>
<span class="command-warning">[+] Wordlist: ${wordlist}</span>
<span class="command-info">[*] Extensions: php,html,txt</span>
<span class="command-warning">/admin                (Status: 200) [Size: 1247]</span>
<span class="command-warning">/backup.php           (Status: 200) [Size: 0]</span>
<span class="command-warning">/config.txt           (Status: 200) [Size: 156]</span>
<span class="command-success">[+] Finished</span>`;
            },

            'aircrack-ng': (args) => {
                const capfile = args[0] || 'capture.cap';
                const wordlist = args.includes('-w') ? args[args.indexOf('-w') + 1] : 'rockyou.txt';
                return `<span class="command-info">Aircrack-ng 1.7</span>
<span class="command-success">[+] Reading packets from ${capfile}...</span>
<span class="command-warning">[+] WPA handshake found for: HomeWiFi</span>
<span class="command-info">[*] Wordlist: ${wordlist}</span>
<span class="command-success">[+] Testing passwords...</span>
<span class="command-warning">[+] KEY FOUND! [ password123 ]</span>
<span class="command-info">[*] Master Key: A1 B2 C3 D4 E5 F6...</span>`;
            },

            'hashcat': (args) => {
                const hashfile = args[0] || 'hashes.txt';
                const attack = args.includes('-a') ? args[args.indexOf('-a') + 1] : '0';
                const mode = args.includes('-m') ? args[args.indexOf('-m') + 1] : '0';
                return `<span class="command-info">hashcat (v6.2.6)</span>
<span class="command-success">[+] Hash file: ${hashfile}</span>
<span class="command-warning">[+] Attack mode: ${attack === '0' ? 'Dictionary' : attack === '3' ? 'Brute-force' : 'Hybrid'}</span>
<span class="command-info">[*] Hash type: ${mode === '0' ? 'MD5' : mode === '1000' ? 'NTLM' : mode === '1800' ? 'SHA-512' : 'Unknown'}</span>
<span class="command-warning">[+] Speed: 1,247.3 MH/s</span>
<span class="command-success">[+] Progress: 50000/14344385 (0.35%)</span>
<span class="command-warning">5d41402abc4b2a76b9719d911017c592:hello</span>
<span class="command-success">[+] Recovered 1 hash</span>`;
            },

            'custom-exploit': (args) => {
                const target = args[0] || '192.168.1.100';
                const port = args[1] || '443';
                return `<span class="command-warning">[+] CUSTOM EXPLOIT FRAMEWORK</span>
<span class="command-success">[+] Target: ${target}:${port}</span>
<span class="command-info">[*] Scanning for vulnerabilities...</span>
<span class="command-warning">[+] Buffer overflow detected in service</span>
<span class="command-success">[+] Crafting payload...</span>
<span class="command-warning">[+] Payload size: 1024 bytes</span>
<span class="command-success">[+] Exploit sent successfully</span>
<span class="command-error">[!] Shell acquired on ${target}</span>
<span class="command-info">[*] Type 'shell' to interact</span>`;
            },

            'penetration-test': (args) => {
                const target = args[0] || '192.168.1.0/24';
                return `<span class="command-warning">[+] AUTOMATED PENETRATION TEST</span>
<span class="command-success">[+] Target scope: ${target}</span>
<span class="command-info">[*] Phase 1: Discovery (25%)</span>
<span class="command-warning">[+] Found 12 live hosts</span>
<span class="command-info">[*] Phase 2: Port scanning (50%)</span>
<span class="command-warning">[+] 47 open ports discovered</span>
<span class="command-info">[*] Phase 3: Vulnerability assessment (75%)</span>
<span class="command-error">[!] 8 critical vulnerabilities found</span>
<span class="command-info">[*] Phase 4: Exploitation (100%)</span>
<span class="command-success">[+] Compromised 3 systems</span>
<span class="command-warning">[+] Report saved to /root/pentest_${Date.now()}.html</span>`;
            }
        };

        if (parameterizedResponses[baseCommand]) {
            const response = parameterizedResponses[baseCommand](args);
            output.innerHTML += response + '\n<span class="user-prompt">┌──(</span><span class="host-prompt">root</span><span class="user-prompt">㉿</span><span class="host-prompt">kali</span><span class="user-prompt">)-[</span><span class="path-prompt">~</span><span class="user-prompt">]</span>\n<span class="user-prompt">└─</span><span class="host-prompt">#</span> ';
            return true;
        }

        return false;
    }

    openFileManager() {
        const content = `
            <div class="file-list">
                <div class="file-item">
                    <div class="file-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <div class="file-name">Desktop</div>
                </div>
                <div class="file-item">
                    <div class="file-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <div class="file-name">Documents</div>
                </div>
                <div class="file-item">
                    <div class="file-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <div class="file-name">Downloads</div>
                </div>
                <div class="file-item">
                    <div class="file-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <div class="file-name">Tools</div>
                </div>
                <div class="file-item">
                    <div class="file-icon">🐍</div>
                    <div class="file-name">exploit.py</div>
                </div>
                <div class="file-item">
                    <div class="file-icon">⚙️</div>
                    <div class="file-name">keylogger.c</div>
                </div>
                <div class="file-item">
                    <div class="file-icon">📄</div>
                    <div class="file-name">passwords.txt</div>
                </div>
                <div class="file-item">
                    <div class="file-icon">📊</div>
                    <div class="file-name">network.log</div>
                </div>
            </div>
        `;

        this.createWindow('File Manager', content, 500, 400);
    }

    openNetworkMonitor() {
        const content = `
            <div class="network-stats">
                <div class="stat-box">
                    <div class="stat-title">Network Status</div>
                    <div class="stat-value">CONNECTED</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Active Connections</div>
                    <div class="stat-value">7</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Data Transfer</div>
                    <div class="stat-value">1.2 GB ↓ / 432 MB ↑</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Firewall Status</div>
                    <div class="stat-value">ACTIVE</div>
                </div>
            </div>
            <br>
            <div style="color: #00ff00; font-family: monospace;">
                <div>Recent Network Activity:</div>
                <div>→ 192.168.1.1 - Gateway ping successful</div>
                <div>→ 8.8.8.8 - DNS resolution active</div>
                <div>→ 203.0.113.1 - SSH connection established</div>
                <div>→ 192.168.1.100 - Local scan initiated</div>
            </div>
        `;

        this.createWindow('Network Monitor', content, 600, 400);
    }

    openSystemMonitor() {
        const content = `
            <div class="system-info">
                <div class="info-row">
                    <span class="info-label">Operating System:</span>
                    <span>Kali Linux 2023.4</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Kernel:</span>
                    <span>5.10.0-kali7-amd64</span>
                </div>
                <div class="info-row">
<span class="info-label">CPU:</span>
                    <span>Intel Core i7-12700K @ 3.60GHz</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Memory:</span>
                    <span>16GB (4.2GB used)</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Disk Usage:</span>
                    <span>512GB SSD (127GB used)</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Uptime:</span>
                    <span>2 days, 14 hours, 37 minutes</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Load Average:</span>
                    <span>0.52, 0.48, 0.51</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Active Processes:</span>
                    <span>187</span>
                </div>
            </div>
        `;

        this.createWindow('System Monitor', content, 550, 350);
    }

    openCodeEditor() {
        const content = `
            <div class="code-editor">
                <div class="editor-toolbar">
                    <button class="editor-button">New</button>
                    <button class="editor-button">Open</button>
                    <button class="editor-button">Save</button>
                    <button class="editor-button">Run</button>
                </div>
                <textarea class="code-area" placeholder="# Enter your exploit code here...
import socket
import sys

def exploit_target(host, port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((host, port))

        payload = 'A' * 1000  # Buffer overflow
        s.send(payload.encode())

        print('[+] Exploit sent successfully')
        print('[+] Waiting for shell...')

    except Exception as e:
        print(f'[-] Error: {e}')
    finally:
        s.close()

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python exploit.py <host> <port>')
        sys.exit(1)

    host = sys.argv[1]
    port = int(sys.argv[2])
    exploit_target(host, port)"></textarea>
            </div>
        `;

        this.createWindow('Code Editor - exploit.py', content, 700, 500);
    }

    openPasswordCracker() {
        const content = `
            <div class="password-cracker">
                <div class="cracker-header">
                    <h3><i class="fa-solid fa-key"></i> Advanced Password Cracking Suite v4.2.0</h3>
                    <div class="cracker-status">Status: <span class="status-ready">Ready</span></div>
                </div>
                
                <div class="cracker-sections">
                    <div class="cracker-section">
                        <h4><i class="fa-solid fa-file-text"></i> Hash Input</h4>
                        <textarea class="hash-input" placeholder="Enter password hashes here (one per line):
5d41402abc4b2a76b9719d911017c592
098f6bcd4621d373cade4e832627b4f6
e99a18c428cb38d5f260853678922e03"></textarea>
                        <div class="hash-type-selector">
                            <label>Hash Type:</label>
                            <select class="hash-type">
                                <option value="md5">MD5</option>
                                <option value="sha1">SHA-1</option>
                                <option value="sha256">SHA-256</option>
                                <option value="ntlm">NTLM</option>
                                <option value="bcrypt">bcrypt</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="cracker-section">
                        <h4><i class="fa-solid fa-cogs"></i> Attack Configuration</h4>
                        <div class="attack-methods">
                            <div class="attack-method">
                                <input type="radio" name="attack" value="dictionary" id="dictionary" checked>
                                <label for="dictionary">Dictionary Attack</label>
                            </div>
                            <div class="attack-method">
                                <input type="radio" name="attack" value="brute" id="brute">
                                <label for="brute">Brute Force</label>
                            </div>
                            <div class="attack-method">
                                <input type="radio" name="attack" value="hybrid" id="hybrid">
                                <label for="hybrid">Hybrid Attack</label>
                            </div>
                            <div class="attack-method">
                                <input type="radio" name="attack" value="rule" id="rule">
                                <label for="rule">Rule-based</label>
                            </div>
                        </div>
                        
                        <div class="wordlist-selector">
                            <label>Wordlist:</label>
                            <select class="wordlist">
                                <option value="rockyou">rockyou.txt (14.3M passwords)</option>
                                <option value="common">common-passwords.txt (10K passwords)</option>
                                <option value="leaked">leaked-passwords-2024.txt (47.2M passwords)</option>
                                <option value="custom">Custom wordlist</option>
                            </select>
                        </div>
                        
                        <div class="cracking-options">
                            <div class="option-row">
                                <label><input type="checkbox" checked> Use GPU acceleration</label>
                                <label><input type="checkbox" checked> Apply common rules</label>
                            </div>
                            <div class="option-row">
                                <label><input type="checkbox"> Use rainbow tables</label>
                                <label><input type="checkbox"> Distributed cracking</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cracker-section">
                        <h4><i class="fa-solid fa-play"></i> Execution Controls</h4>
                        <div class="control-buttons">
                            <button class="crack-button start-crack" onclick="startPasswordCracking()">
                                <i class="fa-solid fa-play"></i> Start Cracking
                            </button>
                            <button class="crack-button stop-crack" onclick="stopPasswordCracking()" disabled>
                                <i class="fa-solid fa-stop"></i> Stop
                            </button>
                            <button class="crack-button pause-crack" onclick="pausePasswordCracking()" disabled>
                                <i class="fa-solid fa-pause"></i> Pause
                            </button>
                        </div>
                        
                        <div class="progress-section">
                            <div class="progress-label">Progress: <span id="progress-text">0%</span></div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill"></div>
                            </div>
                            <div class="speed-info">
                                <span>Speed: <span id="crack-speed">0 H/s</span></span>
                                <span>ETA: <span id="crack-eta">--:--:--</span></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="results-section">
                    <h4><i class="fa-solid fa-trophy"></i> Cracking Results</h4>
                    <div class="results-output" id="crack-results">
                        <div class="no-results">No passwords cracked yet. Start an attack to see results here.</div>
                    </div>
                </div>
                
                <div class="log-section">
                    <h4><i class="fa-solid fa-terminal"></i> Activity Log</h4>
                    <div class="log-output" id="crack-log">
                        <div class="log-entry info">[INFO] Password Cracking Suite initialized</div>
                        <div class="log-entry info">[INFO] GPU devices detected: NVIDIA RTX 4090 (24GB VRAM)</div>
                        <div class="log-entry info">[INFO] Ready to begin password cracking operations</div>
                    </div>
                </div>
            </div>
        `;

        const windowId = this.createWindow('🔓 Password Cracking Suite', content, 900, 700);
        
        // Add the cracking functionality
        setTimeout(() => {
            this.initializePasswordCracker();
        }, 100);
    }

    initializePasswordCracker() {
        // Make functions globally available
        window.startPasswordCracking = () => this.startGUIPasswordCracking();
        window.stopPasswordCracking = () => this.stopGUIPasswordCracking();
        window.pausePasswordCracking = () => this.pauseGUIPasswordCracking();
    }

    startGUIPasswordCracking() {
        const startBtn = document.querySelector('.start-crack');
        const stopBtn = document.querySelector('.stop-crack');
        const pauseBtn = document.querySelector('.pause-crack');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const speedText = document.getElementById('crack-speed');
        const etaText = document.getElementById('crack-eta');
        const resultsOutput = document.getElementById('crack-results');
        const logOutput = document.getElementById('crack-log');

        if (!startBtn || this.isGUICracking) return;

        this.isGUICracking = true;
        this.isPaused = false;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;

        // Clear previous results
        resultsOutput.innerHTML = '<div class="results-header">Live Password Cracking Results:</div>';
        
        // Enhanced startup sequence
        this.addLogEntry(logOutput, 'info', 'Advanced Password Cracking Engine v4.7.2 initializing...');
        this.addLogEntry(logOutput, 'warning', 'Loading enhanced wordlists: rockyou.txt + leaked-2024.txt (47.2M passwords)');
        this.addLogEntry(logOutput, 'success', 'GPU acceleration: NVIDIA RTX 4090 Ti (24GB VRAM) - CUDA cores active');
        this.addLogEntry(logOutput, 'info', 'Rainbow tables: 14.7 TB loaded into high-speed memory');
        this.addLogEntry(logOutput, 'warning', 'Distributed computing: 47 cloud nodes synchronized');
        this.addLogEntry(logOutput, 'success', 'Quantum-enhanced algorithms: Active');

        // ENDLESS animation variables
        let attempts = 0;
        let crackedCount = 0;
        let sessionTime = 0;
        let currentSpeed = 2847.3;
        
        // Realistic password databases
        const commonPasswords = [
            'password123', 'admin', 'letmein', 'welcome', 'monkey', '123456789', 'password1',
            'qwerty123', 'abc123', 'Password1', 'secret', 'root', 'toor', 'admin123',
            'welcome123', 'hello', 'love', 'princess', 'dragon', 'master', 'shadow',
            'superman', 'michael', 'jennifer', 'jordan', 'michelle', 'daniel', 'jessica',
            'killer', 'hunter', 'tigger', 'charlie', 'football', 'baseball', 'soccer',
            'trustno1', 'iloveyou', 'sunshine', 'starwars', 'computer', 'freedom',
            'whatever', 'mercedes', 'chocolate', 'samsung', 'qwertyuiop', 'matrix',
            'naruto', 'pokemon', 'windows', 'nothing', 'picture', 'google', 'facebook'
        ];

        const usernames = [
            'admin', 'administrator', 'root', 'user', 'test', 'guest', 'demo', 'backup',
            'manager', 'service', 'operator', 'support', 'webmaster', 'ftp', 'mail',
            'www', 'web', 'db', 'database', 'mysql', 'oracle', 'postgres', 'jenkins',
            'tomcat', 'apache', 'nginx', 'elastic', 'redis', 'mongo', 'node', 'docker',
            'john.doe', 'jane.smith', 'bob.johnson', 'alice.wilson', 'mike.brown',
            'sarah.davis', 'david.miller', 'lisa.garcia', 'chris.anderson', 'amy.taylor'
        ];

        const hashTypes = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'NTLM', 'bcrypt', 'scrypt', 'Argon2', 'PBKDF2'];
        const algorithms = ['Dictionary', 'Brute-force', 'Hybrid', 'Rule-based', 'Markov', 'PRINCE', 'Combinator', 'Mask'];
        const techniques = [
            'Loading custom wordlist: breached_passwords_2024.txt (89.3M passwords)',
            'Applying advanced mutation rules: l33t speak, capitalization, numbers, symbols',
            'Implementing PRINCE algorithm with keyspace optimization',
            'Using combinator attack: wordlist1.txt + wordlist2.txt + dates',
            'Executing optimized mask attack: ?l?l?l?l?d?d?d?d',
            'Applying Markov chains for statistical password generation',
            'Loading hashcat rules: best64.rule, d3ad0ne.rule, dive.rule, InsidePro-PasswordsPro.rule',
            'Implementing distributed cracking across 47 GPU nodes',
            'Using CUDA optimization: all 10752 cores fully utilized',
            'Loading rainbow tables: 18.4TB ntlm_mixalpha-numeric#1-15',
            'Applying OSINT-gathered passwords from LinkedIn breach',
            'Using social engineering wordlists: company names, employee data, dates',
            'Loading keyboard patterns: qwerty, azerty, dvorak combinations',
            'Implementing hybrid dictionary + brute-force attack',
            'Using leaked password databases: Collection #1-5, Compilation of Many Breaches',
            'Applying context-specific rules: corporate naming conventions'
        ];

        // ENDLESS cracking simulation
        this.crackingInterval = setInterval(() => {
            if (this.isPaused) return;

            sessionTime += 0.3;
            attempts += Math.floor(Math.random() * 75000) + 25000;
            
            // Dynamic speed variation for realism
            currentSpeed = Math.max(1200, currentSpeed + (Math.random() - 0.5) * 200);
            speedText.textContent = currentSpeed.toFixed(1) + ' MH/s';
            
            // Endless progress that never reaches 100%
            const progressPercent = Math.min(97.8, (sessionTime / 300) * 100);
            progressFill.style.width = progressPercent + '%';
            progressText.textContent = progressPercent.toFixed(1) + '%';
            
            // Dynamic ETA calculation
            const remainingMinutes = Math.floor(Math.random() * 45) + 15;
            const remainingSeconds = Math.floor(Math.random() * 60);
            etaText.textContent = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;

            // Regularly crack passwords (realistic success rate)
            if (Math.random() < 0.18) {
                crackedCount++;
                const username = usernames[Math.floor(Math.random() * usernames.length)];
                const password = commonPasswords[Math.floor(Math.random() * commonPasswords.length)];
                const hashType = hashTypes[Math.floor(Math.random() * hashTypes.length)];
                const hash = this.generateRealisticHash(hashType);
                
                this.addCrackedPassword(resultsOutput, username, password, hash, hashType);
                this.addLogEntry(logOutput, 'success', `CRACKED: ${username}:${password} (${hashType})`);
                this.addLogEntry(logOutput, 'info', `Hash: ${hash.substring(0, 32)}...`);
            }

            // Regular status updates with varying information
            if (attempts % 100000 < 75000) {
                const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
                const currentHash = hashTypes[Math.floor(Math.random() * hashTypes.length)];
                
                this.addLogEntry(logOutput, 'info', `Speed: ${currentSpeed.toFixed(1)} MH/s | Algorithm: ${algorithm} | Hash: ${currentHash}`);
                this.addLogEntry(logOutput, 'warning', `Progress: ${attempts.toLocaleString()} attempts | Cracked: ${crackedCount} passwords`);
            }

            // Advanced technique information
            if (Math.random() < 0.25) {
                const technique = techniques[Math.floor(Math.random() * techniques.length)];
                this.addLogEntry(logOutput, 'info', technique);
            }

            // System performance stats
            if (Math.random() < 0.15) {
                const stats = [
                    `GPU temperature: ${Math.floor(Math.random() * 15 + 75)}°C | Memory usage: ${Math.floor(Math.random() * 20 + 75)}%`,
                    `VRAM utilization: ${Math.floor(Math.random() * 10 + 85)}% | Power consumption: ${Math.floor(Math.random() * 50 + 300)}W`,
                    `Network throughput: ${(Math.random() * 100 + 150).toFixed(1)} MB/s | Cloud sync: ${Math.floor(Math.random() * 20 + 80)}%`,
                    `Database queries: ${Math.floor(Math.random() * 2000 + 8000)}/sec | Cache efficiency: ${Math.floor(Math.random() * 15 + 85)}%`,
                    `Active threads: ${Math.floor(Math.random() * 500 + 1500)} | Memory bandwidth: ${(Math.random() * 200 + 800).toFixed(1)} GB/s`,
                    `Rainbow table hits: ${Math.floor(Math.random() * 100 + 200)}/min | Compression ratio: ${(Math.random() * 2 + 3).toFixed(1)}:1`
                ];
                
                const stat = stats[Math.floor(Math.random() * stats.length)];
                this.addLogEntry(logOutput, 'warning', stat);
            }

            // Security discoveries and vulnerabilities
            if (Math.random() < 0.08) {
                const discoveries = [
                    'Weak password policy detected: minimum 6 characters, no complexity requirements',
                    'Password reuse pattern identified across 67% of accounts',
                    'Default credentials discovered: admin/admin, root/toor, guest/guest',
                    'Plaintext passwords found in configuration files',
                    'Unsalted MD5 hashes detected - CRITICAL security vulnerability',
                    'Service account with predictable password pattern discovered',
                    'Shared administrative account: backup/backup123',
                    'Password based on company founding year detected',
                    'Dictionary words with simple number suffixes (90% of passwords)',
                    'Keyboard patterns detected: qwerty123, asdf1234, 1qaz2wsx',
                    'Seasonal passwords found: Summer2024, Spring2024, Winter2023',
                    'Employee personal information used in passwords (birthdays, names)'
                ];
                
                const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
                this.addLogEntry(logOutput, 'error', `VULNERABILITY: ${discovery}`);
            }

            // Advanced attack progress updates
            if (Math.random() < 0.12) {
                const attacks = [
                    'Wordlist position: 47.3% | Current mask: ?l?l?l?l?d?d?d?d',
                    'Rule application: 23,847/50,000 rules tested',
                    'Combinator progress: wordlist_a.txt × wordlist_b.txt (73% complete)',
                    'Markov chain generation: 4-gram model, 89.2% coverage',
                    'PRINCE algorithm: keyspace reduced by 67.4%',
                    'Hybrid attack: dictionary + brute-force suffix (0-999999)',
                    'Rainbow table lookup: 12.7TB scanned, 847 hits',
                    'Distributed nodes: 47/47 active, load balanced'
                ];
                
                const attack = attacks[Math.floor(Math.random() * attacks.length)];
                this.addLogEntry(logOutput, 'info', attack);
            }

        }, Math.random() * 400 + 300); // Random interval 300-700ms for realism
    }

    stopGUIPasswordCracking() {
        if (this.crackingInterval) {
            clearInterval(this.crackingInterval);
            this.crackingInterval = null;
        }

        this.isGUICracking = false;
        
        const startBtn = document.querySelector('.start-crack');
        const stopBtn = document.querySelector('.stop-crack');
        const pauseBtn = document.querySelector('.pause-crack');
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = true;

        const logOutput = document.getElementById('crack-log');
        if (logOutput) {
            this.addLogEntry(logOutput, 'warning', 'Password cracking attack stopped by user');
        }
    }

    pauseGUIPasswordCracking() {
        // Toggle pause state
        this.isPaused = !this.isPaused;
        const pauseBtn = document.querySelector('.pause-crack');
        const logOutput = document.getElementById('crack-log');
        
        if (this.isPaused) {
            pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
            this.addLogEntry(logOutput, 'warning', 'Password cracking attack paused by user');
            this.addLogEntry(logOutput, 'info', 'All cracking threads suspended, preserving session state');
        } else {
            pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
            this.addLogEntry(logOutput, 'success', 'Password cracking attack resumed');
            this.addLogEntry(logOutput, 'info', 'All cracking threads reactivated, continuing from checkpoint');
        }
    }

    addLogEntry(logOutput, type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        logOutput.appendChild(entry);
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    addCrackedPassword(resultsOutput, username, password, hash, hashType) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'cracked-entry';
        entry.innerHTML = `
            <div class="crack-timestamp">[${timestamp}]</div>
            <div class="crack-info">
                <div class="username-result">${username}</div>
                <div class="password-result">${password}</div>
                <div class="hashtype-result">(${hashType})</div>
            </div>
            <div class="hash-result">${hash}</div>
        `;
        resultsOutput.appendChild(entry);
        resultsOutput.scrollTop = resultsOutput.scrollHeight;

        // Add visual flash effect
        entry.style.animation = 'crackedFlash 0.5s ease-out';
    }

    addToTaskbar(windowId, title) {
        const taskbar = document.getElementById('taskbar-apps');
        const taskbarApp = document.createElement('div');
        taskbarApp.className = 'taskbar-app active';
        taskbarApp.textContent = title;
        taskbarApp.dataset.windowId = windowId;

        taskbarApp.addEventListener('click', () => {
            const window = this.windows.get(windowId);
            if (window.minimized) {
                this.restoreWindow(windowId);
            } else {
                this.focusWindow(windowId);
            }
        });

        taskbar.appendChild(taskbarApp);
    }

    focusWindow(windowId) {
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        document.querySelectorAll('.taskbar-app').forEach(t => t.classList.remove('active'));

        const window = this.windows.get(windowId);
        if (window) {
            window.element.classList.add('active');
            window.element.style.zIndex = ++this.windowZIndex;

            const taskbarApp = document.querySelector(`[data-window-id="${windowId}"]`);
            if (taskbarApp) taskbarApp.classList.add('active');
        }
    }

    closeWindow(windowId) {
        const window = this.windows.get(windowId);
        if (window) {
            window.element.remove();
            const taskbarApp = document.querySelector(`[data-window-id="${windowId}"]`);
            if (taskbarApp) taskbarApp.remove();
            this.windows.delete(windowId);
        }
    }

    minimizeWindow(windowId) {
        const window = this.windows.get(windowId);
        if (window) {
            window.element.style.display = 'none';
            window.minimized = true;
            const taskbarApp = document.querySelector(`[data-window-id="${windowId}"]`);
            if (taskbarApp) taskbarApp.classList.remove('active');
        }
    }

    restoreWindow(windowId) {
        const window = this.windows.get(windowId);
        if (window) {
            window.element.style.display = 'block';
            window.minimized = false;
            this.focusWindow(windowId);
        }
    }

    startDrag(e, windowElement) {
        this.draggedWindow = windowElement;
        const rect = windowElement.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.focusWindow(windowElement.id);
        document.body.style.userSelect = 'none';
        windowElement.style.cursor = 'grabbing';
    }

    drag(e) {
        if (this.draggedWindow) {
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;

            // Constrain to viewport
            const maxX = window.innerWidth - 200;
            const maxY = window.innerHeight - 44; // Account for taskbar

            this.draggedWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            this.draggedWindow.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        }
    }

    stopDrag() {
        if (this.draggedWindow) {
            this.draggedWindow.style.cursor = '';
            this.draggedWindow = null;
        }
        document.body.style.userSelect = '';
    }

    isResizeHandle(e, windowElement) {
        const rect = windowElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const threshold = 10;

        return (
            x >= rect.width - threshold || // right edge
            y >= rect.height - threshold || // bottom edge
            (x >= rect.width - threshold && y >= rect.height - threshold) // bottom-right corner
        );
    }

    startResize(e, windowElement) {
        this.resizingWindow = windowElement;
        const rect = windowElement.getBoundingClientRect();
        this.resizeStart = {
            x: e.clientX,
            y: e.clientY,
            width: rect.width,
            height: rect.height
        };
        this.focusWindow(windowElement.id);
        document.body.style.userSelect = 'none';
    }

    resize(e) {
        if (this.resizingWindow && this.resizeStart) {
            const deltaX = e.clientX - this.resizeStart.x;
            const deltaY = e.clientY - this.resizeStart.y;
            
            const newWidth = Math.max(300, this.resizeStart.width + deltaX);
            const newHeight = Math.max(200, this.resizeStart.height + deltaY);
            
            this.resizingWindow.style.width = newWidth + 'px';
            this.resizingWindow.style.height = newHeight + 'px';
        }
    }

    stopResize() {
        if (this.resizingWindow) {
            this.resizingWindow = null;
            this.resizeStart = null;
        }
        document.body.style.userSelect = '';
    }

    updateCursor(e) {
        const windowElement = e.target.closest('.window');
        if (windowElement && !this.draggedWindow && !this.resizingWindow) {
            const rect = windowElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const threshold = 10;

            if (x >= rect.width - threshold && y >= rect.height - threshold) {
                windowElement.style.cursor = 'se-resize';
            } else if (x >= rect.width - threshold) {
                windowElement.style.cursor = 'e-resize';
            } else if (y >= rect.height - threshold) {
                windowElement.style.cursor = 's-resize';
            } else {
                windowElement.style.cursor = '';
            }
        }
    }
}

// Initialize the desktop when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HackerDesktop();
});