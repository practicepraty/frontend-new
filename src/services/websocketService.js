class WebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 1000;
        this.listeners = new Map();
        this.connectionState = 'disconnected';
        this.baseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8002';
    }

    connect(requestId) {
        return new Promise((resolve, reject) => {
            try {
                if (this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.close();
                }

                const wsUrl = `${this.baseUrl}/ws/processing/${requestId}`;
                this.ws = new WebSocket(wsUrl);
                this.connectionState = 'connecting';

                this.ws.onopen = () => {
                    this.connectionState = 'connected';
                    this.reconnectAttempts = 0;
                    this.emit('connectionStateChange', 'connected');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    this.connectionState = 'disconnected';
                    this.emit('connectionStateChange', 'disconnected');
                    
                    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect(requestId);
                    }
                };

                this.ws.onerror = (error) => {
                    this.connectionState = 'error';
                    this.emit('connectionStateChange', 'error');
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                setTimeout(() => {
                    if (this.connectionState === 'connecting') {
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                reject(error);
            }
        });
    }

    scheduleReconnect(requestId) {
        this.reconnectAttempts++;
        const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
        
        setTimeout(() => {
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect(requestId).catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    handleMessage(data) {
        switch (data.type) {
            case 'progress':
                this.emit('progress', data.payload);
                break;
            case 'status':
                this.emit('status', data.payload);
                break;
            case 'error':
                this.emit('error', data.payload);
                break;
            case 'complete':
                this.emit('complete', data.payload);
                break;
            case 'heartbeat':
                this.sendHeartbeat();
                break;
            default:
                console.warn('Unknown WebSocket message type:', data.type);
        }
    }

    sendHeartbeat() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in WebSocket event callback:', error);
                }
            });
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.connectionState = 'disconnected';
        this.listeners.clear();
    }

    getConnectionState() {
        return this.connectionState;
    }

    isConnected() {
        return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN;
    }

    send(message) {
        if (this.isConnected()) {
            this.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    cancelProcessing(requestId) {
        return this.send({
            type: 'cancel',
            requestId: requestId
        });
    }
}

export default new WebSocketService();