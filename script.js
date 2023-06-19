// Creating a basic service for customers
class customerService {
  constractor(domain, endPoint, apiKey) {
    this.domain = domain;
    this.endPoint = endPoint;
    this.apiKey = apiKey;
  }

  get(customerId) {
    return axios.get(`${this.domain}/${this.endPoint}/${customerId}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` } });
  }

  list(limit = 50, offset = 0, id = null, name = null) {
    let params = { limit, offset };
    if (id) params["id"] = id;
    if (name) params["name"] = name;
    return axios.get(`${this.domain}/${this.endPoint}`, { params, headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` } });
  }

  set(customerData) {
    return axios.post(`${this.domain}/${this.endPoint}`, customerData, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` } });
  }

  update(customerId) {
    return axios.put(`${this.domain}/${this.endPoint}/${customerId}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` } });
  }

  delete(customerId) {
    return axios.delete(`${this.domain}/${this.endPoint}/${customerId}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` } });
  }
}

/**
 * Synchronization of customers between two services.
 *
 * @param {serviceOne} serviceOne resource service.
 * @param {serviceTwo} serviceTwo target service.
 */
async function syncCustomers(serviceOne, serviceTwo) {
  try {
    let limit = 50;
    let offset = 0;
    let { data } = await serviceOne.list(limit, offset);
    let customerList = data;
    while (Array.isArray(customerList) && customerList.length > 0) {
      let report = await Promise.all(
        customerList.map(async (customer) => {
          try {
            await serviceTwo.set(customer);
            return { status: "inserted", customer };
          } catch (error) {
            return { status: "failed", customer };
          }
        })
      );
      console.log(report);
      offset = offset + limit - 1;
      let { data } = await serviceOne.list(limit, offset);
      customerList = data;
    }

    console.log("customers have been synced.");
  } catch (error) {
    console.error(error);
  }
}

// Creating the resource service.
const customerServiceOne = new customerService("https://api1.example.com", "api/v1/customer", "example-api-key-1");

// Creating the target service
const customerServiceTwo = new customerService("https://api2.example.com", "api/v1/customer", "example-api-key-2");

syncCustomers(customerServiceOne, customerServiceTwo);
