export class DeveloperComponent {
  constructor() {
    this.redirectToDevPage();
  }

  private redirectToDevPage(): void {
    window.location.href = '/developer.html';
  }
}
