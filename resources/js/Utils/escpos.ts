export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init() {
    this.buffer.push(0x1B, 0x40); // ESC @ (Initialize printer)
  }

  text(str: string) {
    for (let i = 0; i < str.length; i++) {
      // Basic ASCII conversion. 
      // Replace non-ASCII with space if needed, or handle code pages.
      const code = str.charCodeAt(i);
      if (code < 256) {
        this.buffer.push(code);
      } else {
        this.buffer.push(0x3F); // '?' for unsupported characters
      }
    }
  }

  textLine(str: string) {
    this.text(str);
    this.newline();
  }

  newline() {
    this.buffer.push(0x0A); // LF
  }

  alignCenter() {
    this.buffer.push(0x1B, 0x61, 1); // ESC a 1
  }

  alignLeft() {
    this.buffer.push(0x1B, 0x61, 0); // ESC a 0
  }

  alignRight() {
    this.buffer.push(0x1B, 0x61, 2); // ESC a 2
  }

  bold(on: boolean) {
    this.buffer.push(0x1B, 0x45, on ? 1 : 0); // ESC E n
  }

  setSize(widthMultiplier: number, heightMultiplier: number) {
    // GS ! n (Select character size)
    // n = (widthMultiplier - 1) * 16 + (heightMultiplier - 1)
    const w = Math.max(1, Math.min(8, widthMultiplier)) - 1;
    const h = Math.max(1, Math.min(8, heightMultiplier)) - 1;
    const n = (w << 4) | h;
    this.buffer.push(0x1D, 0x21, n);
  }

  feed(lines: number = 1) {
    this.buffer.push(0x1B, 0x64, lines); // ESC d n
  }

  cut() {
    // GS V 0 (partial cut) - some printers support this, others just ignore
    this.buffer.push(0x1D, 0x56, 0x00);
  }
  
  separator(char: string = '-', width: number = 32) {
    this.textLine(char.repeat(width));
  }

  justify(left: string, right: string, width: number = 32) {
    if (left.length + right.length >= width) {
      this.textLine(left.substring(0, width - right.length - 1) + ' ' + right);
    } else {
      this.textLine(left + ' '.repeat(width - left.length - right.length) + right);
    }
  }

  getBytes() {
    return new Uint8Array(this.buffer);
  }
}
