export default function () {
  const application = arguments[1] || arguments[0];

  application.inject('service:path-inspector', 'router', 'router:main');
  application.inject('route', 'pathInspectorService', 'service:path-inspector');
  application.inject('controller', 'pathInspectorService', 'service:path-inspector');
}
