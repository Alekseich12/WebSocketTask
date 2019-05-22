export class WebSocketService {
  // Подключение по WebSocket
  public ws: WebSocket;
  public id: number;


  // Поскольку WebSocket открывается асинхронно, а конструктор - синхронный метод,
  // инициализировать сервис необходимо не с помощью конструктора.
  // Это необходимо для избежания отправки запросов по ещё не открытому соединению.
  // Для этого сделана статическая функция instantiate, которая служит асинхронной инициализацией сервиса.
  public constructor(url: string) {
    this.ws = new WebSocket (url);
    this.ws.onclose = () =>  setTimeout(() => this.ws = new WebSocket(url), 1000);
    this.id = 1;
  }

  // В метод передаются обязательный параметр method и необязательный параметр params (массив с любыми значениями).
  // В методе возникает генерация случайного id
  public fetch = (method: string, params: Array<any> = []): Promise<any> => {

    // Генерируем запрос.
    // Согласно документации, запрос необходимо передавать в JSON:
    // { "id": 123, "method": "some.method", "params": [] }
    // Сообщения по WebSocket отправляются в строке.
    // Для получения такого запроса создаём объект и делаем из него строку с помощью JSON.stringify(Object)
    const requestData = {
      id: this.id,
      method,
      params,
    };

    const requestString = JSON.stringify(requestData);

    // Возвращаем Promise, который выполнится в тот момент,
    // когда по идентификатору будет получено сообщение.
    // Для реализации этого навешиваем обработчик на получение нового сообщения по WebSocket.
    // В случае нового сообщения проверяем его JSON формат и переданный id.
    // Если id в полученном сообщении соответствует id в переданном сообщении,
    // значит полученное сообщение является ответом на переданное сообщение. В этом случае вызываем resolve().
    // После навешивания обработчика отправляем запрос.
    // Навесить обработчик до запроса необходимо для того, чтобы в случае моментального ответа не пропустить его.
    return new Promise((resolve, reject) => {
      const handler = (message: MessageEvent) => {
        // Парсим JSON
        // Не обрабатываем ошибку парсинга JSON, так как это исключительная ситуация.
        const json = JSON.parse(message.data);
        if (json.id !== this.id) {
          // Сообщение с несоответствующим идентификатором не рассматриваем.
          return;
        }

        // В случае успеха удаляем текущий обработчик, чтобы он не вызывался каждый раз.
        this.ws.removeEventListener('message', handler);

        if (json.error && !json.result) {
          return reject('error' + json);
        }

        resolve(json);
      };

      this.ws.addEventListener('message', handler);

      // Отправляем запрос в WebSocket.
      this.ws.send(requestString);
    });
  }

  public listen = (method: string, callback: Function): void => {
    // Определяем обработчик для переданного метода.
    // Входящие сообщения по этой подписке будет иметь .update.
    // Таким образом можно отфильтровать входящие сообщения и обработать только необходимые.
    // В случае совпадения имени метода вызываем переданный callback, передавая в него сообщение,которое получаем.
    this.ws.addEventListener('message', (message: MessageEvent) => {
      // Не обрабатываем ошибку парсинга JSON, так как это исключительная ситуация.
      const json = JSON.parse(message.data);
      if (json.method !== method) {
        return;
      }
      callback(json);
    });

    // Отправляем запрос method.subscribe (по документации).
    // В переданный метод добавляется .subscribe.
    // Сообщение отправляется после добавления обработчика для того,
    // чтобы не пропустить update в случае моментального ответа.
    this.fetch(`${method}.subscribe`, [`ETH_BTC`]);
  }
}
