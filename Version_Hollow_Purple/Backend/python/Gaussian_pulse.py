#! /usr/bin/env python3

import asyncio
from pyvirtualbench import PyVirtualBench, PyVirtualBenchException, FGenWaveformMode
from waveform import GaussianPulse
from websockets.server import serve
from numpy import array, arange, fft, max
from math import pi
import json

model = ''

def triggerWaveform(inputs):
    pulse = GaussianPulse(inputs['amplitude'], inputs['frecuency'], inputs['nSamples'], inputs['fs'], inputs['hgw'])
    data ['connectDev'] = True

    pulseArrayTime = array(pulse.y)
    sample_rate = 1/float(inputs['fs'] )
    fgen.stop()
    fgen.configure_arbitrary_waveform(pulseArrayTime.tolist(), sample_rate)#Sample rate 100S/s=>0.01 100000=>0.00001
    fgen.run()
    t = array(pulse.t)
    w = array(pulse.w)
    pulseArrayFrec = array(pulse.getFFT())
    data ["fGen"] = { "t" : t.tolist(), "w" : w.tolist(), "timeY" : pulseArrayTime.tolist(), "frecY" : pulseArrayFrec.tolist()}
    fgen.release()
    

def msoData(sampleRate):
    t = []
    w = []

    channel_1 = mso.query_analog_channel(model+'/mso/1')
    # channel_2 = mso.query_analog_channel(model+'/mso/2')
    mso.stop()
    mso.configure_immediate_trigger()
    mso.reset_instrument()
    mso.auto_setup()

    mso.configure_analog_channel(model+'/mso/1', True, channel_1[1], channel_1[2], channel_1[3], channel_1[4])
    # mso.configure_analog_channel(model+'/mso/2', True, channel_2[1], channel_2[2], channel_2[3], channel_2[4])

    # print( mso.query_analog_channel('VB8012-3178C78/mso/2'))
    sample_rate, acquisition_time, pretrigger_time, sampling_mode = mso.query_timing()

    mso.configure_timing(sampleRate, 0.024894966761633427, 0.012447483380816714, sampling_mode)
    print(mso.query_timing())
    channels = mso.query_enabled_analog_channels()
    channels_enabled, number_of_channels = virtualbench.collapse_channel_string(channels)
    print(channels_enabled, number_of_channels)

     
    mso.run()
    
    analogData = mso.read_analog_digital_u64()[0]

    mso.release()

    data['fmso'] = {}

    some = arange(0, len(analogData), dtype=float)
    
    for sample in some:
        t.append(sample/sampleRate)

    data['fmso']['t'] = array(t).tolist()
  
    data['fmso']['timeY'] = analogData
    
    for sample in t:
        w.append (sample * (2 * pi)/(len(analogData)))

    data['fmso']['w'] = w

    data['fmso']['frecY'] = array(abs(fft.fft(analogData))).tolist()

def getAverage():
    t = data['fmso']['t']
    timeY = data['fmso']['timeY']
    maxValue = max(t)
    step = []
    average = [] 

    for i in range(len(t)-1):
        base = t[i] - t[i+1] 
        area = base * ((timeY[i+1]+timeY[i])/2)
        step.append(i)
        average.append(area/maxValue)
    data["average"] = { "t" : step, "timeY" : average}
        # average = 




async def echo(websocket):
    async for message in websocket:
        msg = json.loads(message)
        print(msg)
        global model, data
        data = {}
        try:
            if msg['button'] == 'connect':
                if model != msg['model']:
                     global virtualbench
                     model = msg['model']
                     virtualbench = PyVirtualBench(model)
                else:
                    print('Ya lo tienes')
                    
                await websocket.send(json.dumps({'connectDev' : True}))
            elif msg['button'] == 'send':
               global fgen, mso
               virtualbench = PyVirtualBench(model)
               fgen = virtualbench.acquire_function_generator()
               mso = virtualbench.acquire_mixed_signal_oscilloscope()
               triggerWaveform(msg)
               msoData(msg ['fs'])
               getAverage()
               await websocket.send(json.dumps(data))
            #    await websocket.send(json.dumps({'data' : msoData(msg['sampleRate'])}))
            #    while True:
            #       await websocket.send(json.dumps({'data' : msoData(msg['sampleRate'])}))
            #       await asyncio.sleep(1)
            elif msg['button'] == 'stop': 
                virtualbench = PyVirtualBench(model)
                fgen = virtualbench.acquire_function_generator()
                try:
                    fgen.stop()
                    fgen.release()
                    mso.stop()
                    mso.release()
                except:
                    print('No esta ejecutandose')

        except PyVirtualBenchException as e:
            await websocket.send(json.dumps({'connectDev' : False}))
            print("Error/Warning %d occurred\n%s" % (e.status, e))
        finally:
            virtualbench.release()
if __name__ == '__main__':
    async def main():
        print("Service Up....")
        async with serve(echo, "0.0.0.0", 1025):
            await asyncio.Future()  # run forever

    asyncio.run(main())

