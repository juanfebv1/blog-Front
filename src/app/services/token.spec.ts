import { TestBed } from '@angular/core/testing';

import { Token } from './token';


describe('Token', () => {
  let service: Token;
  const token = 'access-token';
  const refresh = 'refresh-token'

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Token);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveToken()', () => {
    service.saveToken(token);
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('getToken', () => {
    spyOn(localStorage, 'getItem').and.returnValue(token);
    const tokenObtained = service.getToken();
    expect(tokenObtained).toBe(token);
  });

  it('removeToken()', () => {
    localStorage.setItem('token', token);
    service.removeToken();
    expect(localStorage.getItem('token')).toBeNull();
  });

    it('saveRefreshToken()', () => {
    service.saveRefreshToken(refresh);
    expect(localStorage.getItem('refresh')).toBe(refresh);
  });

  it('getRefreshToken', () => {
    spyOn(localStorage, 'getItem').and.returnValue(refresh);
    const tokenObtained = service.getRefreshToken();
    expect(tokenObtained).toBe(refresh);
  });

  it('removeRefreshToken()', () => {
    localStorage.setItem('refresh', refresh);
    service.removeRefreshToken();
    expect(localStorage.getItem('refresh')).toBeNull();
  });

  describe('isValidToken()', () => {
    it('should return true if token is not expired', () => {
      const futureTimeStamp = Math.floor(Date.now() / 1000) + 3600;
      spyOn(service, 'getToken').and.returnValue('some-token-just-for-test');
      spyOn<any>(service, 'decode').and.returnValue({exp: futureTimeStamp});

      expect(service.isValidtoken()).toBeTrue();
    });

    it('should return false if token expired', () => {
      const pastTimeStamp = Math.floor(Date.now() / 1000) - 3600;
      spyOn(service, 'getToken').and.returnValue('some-token-just-for-test');
      spyOn<any>(service, 'decode').and.returnValue({exp: pastTimeStamp});

      expect(service.isValidtoken()).toBeFalse();
    })
  });

  describe('isValidRefreshToken()', () => {
    it('should return true if token is not expired', () => {
      const futureTimeStamp = Math.floor(Date.now() / 1000) + 3600;
      spyOn(service, 'getRefreshToken').and.returnValue('some-token-just-for-test');
      spyOn<any>(service, 'decode').and.returnValue({exp: futureTimeStamp});

      expect(service.isValidRefreshToken()).toBeTrue();
    });

    it('should return false if token expired', () => {
      const pastTimeStamp = Math.floor(Date.now() / 1000) - 3600;
      spyOn(service, 'getRefreshToken').and.returnValue('some-token-just-for-test');
      spyOn<any>(service, 'decode').and.returnValue({exp: pastTimeStamp});

      expect(service.isValidRefreshToken()).toBeFalse();
    })
  });



});
