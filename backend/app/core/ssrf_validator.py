import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple

BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),          # Current network (only valid as source address)
    ipaddress.ip_network("10.0.0.0/8"),         # Private network RFC 1918
    ipaddress.ip_network("100.64.0.0/10"),      # Shared Address Space RFC 6598
    ipaddress.ip_network("127.0.0.0/8"),        # Loopback
    ipaddress.ip_network("169.254.0.0/16"),     # Link-local / Cloud metadata (AWS, GCP, Azure)
    ipaddress.ip_network("172.16.0.0/12"),      # Private network RFC 1918
    ipaddress.ip_network("192.0.0.0/24"),       # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),       # TEST-NET-1
    ipaddress.ip_network("192.168.0.0/16"),     # Private network RFC 1918
    ipaddress.ip_network("198.18.0.0/15"),      # Benchmarking
    ipaddress.ip_network("198.51.100.0/24"),    # TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),     # TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved
    ipaddress.ip_network("255.255.255.255/32"), # Broadcast
    # IPv6
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("::1/128"),            # Loopback
    ipaddress.ip_network("fc00::/7"),           # Unique local
    ipaddress.ip_network("fe80::/10"),          # Link-local
    ipaddress.ip_network("ff00::/8"),           # Multicast
]

def is_ip_blocked(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    for net in BLOCKED_IP_NETWORKS:
        if ip_obj in net:
            return True
    return False

def validate_target_url(raw_url: str) -> Tuple[bool, str, str]:
    """
    Validates a target URL against SSRF and protocol exploits.
    Returns: (is_valid: bool, validated_url: str, error_message: str)
    """
    raw_url = raw_url.strip()
    if not raw_url:
        return False, "", "URL cannot be empty."

    if not (raw_url.startswith("http://") or raw_url.startswith("https://")):
        raw_url = "https://" + raw_url

    try:
        parsed = urlparse(raw_url)
    except Exception as e:
        return False, "", f"Malformed URL format: {str(e)}"

    if parsed.scheme not in ("http", "https"):
        return False, "", f"Invalid scheme '{parsed.scheme}'. Only http and https are permitted."

    if parsed.username or parsed.password:
        return False, "", "URLs with embedded credentials are not allowed for security reasons."

    hostname = parsed.hostname
    if not hostname:
        return False, "", "URL missing valid hostname."

    # Safe exemption ONLY for local static test fixtures
    if (hostname in ("127.0.0.1", "localhost") and parsed.path.startswith("/static/test_pages/")):
        return True, raw_url, ""

    # Reject known loopback names
    if hostname.lower() in ("localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback"):
        return False, "", f"Scanning localhost or loopback destinations ({hostname}) is forbidden."

    # DNS Resolution validation
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
    except socket.gaierror:
        return False, "", f"Could not resolve domain name '{hostname}'."
    except Exception as e:
        return False, "", f"DNS resolution failed: {str(e)}"

    if not addr_info:
        return False, "", f"No IP address found for '{hostname}'."

    # Check all resolved IPs against blocked private/internal ranges
    for info in addr_info:
        sockaddr = info[4]
        ip_str = sockaddr[0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            if is_ip_blocked(ip_obj):
                return False, "", f"Access to private, link-local, or internal IP address ({ip_str}) is blocked."
        except ValueError:
            return False, "", f"Invalid IP address format: {ip_str}"

    return True, raw_url, ""
