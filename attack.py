import requests
import time

def test_rate_limit(url, num_requests=150):
    """Test the rate limiting of a server by making repeated requests"""
    
    success_count = 0
    rate_limited_count = 0
    error_count = 0
    
    print(f"Making {num_requests} requests to {url}...")
    
    for i in range(num_requests):
        try:
            # Make request to the server
            response = requests.get(url)
            
            # Check the response status
            if response.status_code == 429:  # Too Many Requests
                rate_limited_count += 1
                print(f"Request {i+1}: RATE LIMITED (429)")
                print(f"Server has became angry so exiting...")
                break
            elif response.status_code == 200:
                success_count += 1
                print(f"Request {i+1}: Success (200)")
            else:
                error_count += 1
                print(f"Request {i+1}: Error ({response.status_code})")
                
        except Exception as e:
            error_count += 1
            print(f"Request {i+1}: Failed with error: {str(e)}")
        
        # Small delay to see the progression
        time.sleep(0.1)
    
    # Print summary
    print("\n----- RESULTS -----")
    print(f"Total requests:  {num_requests}")
    print(f"Successful:      {success_count}")
    print(f"Rate limited:    {rate_limited_count}")
    print(f"Other errors:    {error_count}")

if __name__ == "__main__":
    # Default to localhost if no URL provided
    server_url = input("Enter server URL (default: http://localhost:3000/api/users): ")
    if not server_url:
        server_url = "http://localhost:3000/api/users"
    
    # Ask for number of requests to make
    try:
        num_requests = int(input("Enter number of requests to make (default: 150): ") or "150")
    except ValueError:
        num_requests = 150
    
    # Run the test
    test_rate_limit(server_url, num_requests)
